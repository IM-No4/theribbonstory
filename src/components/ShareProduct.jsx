import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Share2, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productShareUrl, SITE_NAME } from "../utils/seo";
import { assetUrl } from "../api/client";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.496 2 2 6.494 2 12.029c0 1.954.558 3.844 1.616 5.467L2 22l4.633-1.583A9.975 9.975 0 0012.031 22C17.568 22 22.062 17.505 22.062 12.03 22.062 6.495 17.568 2 12.031 2zm0 18.25c-1.635 0-3.237-.442-4.634-1.28l-.333-.2-3.08.807.822-3-.217-.346a8.212 8.212 0 01-1.264-4.202c0-4.549 3.702-8.25 8.25-8.25 4.55 0 8.25 3.701 8.25 8.25 0 4.548-3.7 8.25-8.25 8.25zm4.52-6.177c-.247-.124-1.463-.722-1.69-.805-.227-.082-.392-.124-.557.124-.165.248-.639.805-.783.97-.144.165-.289.186-.536.062-.247-.124-1.045-.386-1.99-1.23-.736-.656-1.233-1.467-1.378-1.714-.144-.247-.015-.381.109-.504.111-.112.247-.289.371-.433.124-.144.165-.248.247-.412.083-.165.042-.31-.02-.433-.062-.124-.557-1.341-.763-1.836-.201-.482-.405-.417-.557-.425l-.474-.008c-.165 0-.433.062-.66.31-.227.247-.866.846-.866 2.063s.887 2.393 1.01 2.558c.124.165 1.745 2.664 4.227 3.737.591.256 1.052.408 1.411.523.593.188 1.133.162 1.56.098.476-.071 1.463-.598 1.669-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.165-.474-.289z" />
    </svg>
  );
}

/**
 * Modern, responsive Share component:
 * - Trigger button matching product actions height & style
 * - Full-screen backdrop blur modal on desktop, smooth bottom-sheet on mobile
 * - WhatsApp direct share, copy link with live feedback, and native share sheet
 */
export default function ShareProduct({ product, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product?.slug) return null;

  const url = productShareUrl(product.slug);
  const text = `${product.name} — ${formatPrice(product.price)} at ${SITE_NAME || "The Ribbon Story"}`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!", { icon: "🔗" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const nativeShare = () => {
    if (canNativeShare) {
      navigator.share({ title: product.name, text, url }).catch(() => {});
      setOpen(false);
    }
  };

  // Close on Escape & Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Mobile drag bar */}
            <div className="mx-auto -mt-1 mb-3 h-1 w-10 rounded-full bg-stone-200 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-stone-900">
                  Share this Keepsake
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  Share this unique gift with friends or family
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition cursor-pointer"
                aria-label="Close share dialog"
              >
                <X size={16} />
              </button>
            </div>

            {/* Product Preview Card */}
            <div className="my-4 flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-2.5">
              <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200/80 bg-white">
                <img
                  src={assetUrl(product.images?.[0])}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/photo-magnet.webp";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs sm:text-sm font-bold text-stone-900">
                  {product.name}
                </span>
                <span className="text-xs font-semibold text-rose-600">
                  {formatPrice(product.price)}
                </span>
                <span className="block text-[10px] sm:text-[11px] text-stone-400 truncate">
                  The Ribbon Story
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {/* WhatsApp Share */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between w-full rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 p-3 text-emerald-950 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                    <WhatsAppIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-bold text-emerald-950">
                      Share via WhatsApp
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-emerald-700">
                      Send to your chat, group, or status
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-emerald-600 transition group-hover:translate-x-0.5" />
              </a>

              {/* Native System Share (if available) */}
              {canNativeShare && (
                <button
                  type="button"
                  onClick={nativeShare}
                  className="group flex items-center justify-between w-full rounded-xl border border-stone-200 bg-white hover:bg-stone-50 p-3 text-stone-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
                      <Share2 size={17} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        More Sharing Apps
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-stone-500">
                        Instagram, Messages, AirDrop &amp; more
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-stone-400 transition group-hover:translate-x-0.5" />
                </button>
              )}

              {/* Copy Link Field */}
              <div className="pt-1">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                  Direct Link
                </label>
                <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1">
                  <div className="flex items-center gap-2 px-2.5 flex-1 min-w-0">
                    <Link2 size={14} className="text-stone-400 shrink-0" />
                    <span className="text-xs text-stone-600 truncate font-mono select-all">
                      {url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyLink}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
                      copied
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-stone-800 border border-stone-200 hover:bg-stone-100"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={13} strokeWidth={2.5} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <span>Copy</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Share Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 active:scale-[0.97] cursor-pointer ${className}`}
        title="Share this keepsake"
        aria-label="Share this keepsake"
      >
        <Share2 size={17} strokeWidth={1.8} />
      </button>

      {/* Portal to body so no parent styling, clipping, or transforms affect the modal */}
      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
