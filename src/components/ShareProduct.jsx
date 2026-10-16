import { useState, useRef, useEffect } from "react";
import { Check, Link2, MessageCircle, Share2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productShareUrl } from "../utils/seo";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/**
 * Share button with icon trigger. Clicking opens a compact popover with WhatsApp,
 * Copy Link, and native share.
 */
export default function ShareProduct({ product, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  if (!product?.slug) return null;

  const url = productShareUrl(product.slug);
  const text = `${product.name} — ${formatPrice(product.price)} at The Ribbon Story`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const nativeShare = () => {
    navigator.share({ title: product.name, text, url }).catch(() => {});
    setOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Share Trigger Button - Just the Share Icon */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-9.5 h-9.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 shrink-0"
        title="Share this keepsake"
        aria-label="Share this keepsake"
      >
        <Share2 size={15} />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl shadow-lg border border-stone-200/90 p-1.5 z-30 text-xs select-none"
          >
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
              <span>Share</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer font-medium"
            >
              <MessageCircle size={14} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={copyLink}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-rose-50 hover:text-rose-900 transition cursor-pointer font-medium text-left"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 size={14} className="text-stone-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {canNativeShare && (
              <button
                type="button"
                onClick={nativeShare}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-stone-700 hover:bg-rose-50 hover:text-rose-900 transition cursor-pointer font-medium text-left"
              >
                <Share2 size={14} className="text-rose-500" />
                <span>More Options</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
