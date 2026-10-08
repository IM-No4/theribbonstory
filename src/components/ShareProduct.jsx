import { useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { productShareUrl } from "../utils/seo";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/**
 * Share a product. Uses the API's share page so WhatsApp/Instagram show
 * the product's photo, name and price in the link preview.
 */
export default function ShareProduct({ product }) {
  const [copied, setCopied] = useState(false);
  if (!product?.slug) return null;

  const url = productShareUrl(product.slug);
  const text = `${product.name} — ${formatPrice(product.price)} at The Ribbon Story`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const nativeShare = () => navigator.share({ title: product.name, text, url }).catch(() => {});

  const button =
    "flex-1 py-2 px-3 rounded-xl border border-blush-200 bg-white hover:bg-rose-50 text-burgundy-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer";

  return (
    <div className="flex items-center gap-2" aria-label="Share this keepsake">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={button}
      >
        <MessageCircle size={14} className="text-emerald-600" />
        <span>WhatsApp</span>
      </a>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={button}>
          <Share2 size={14} className="text-ribbon-500" />
          <span>Share</span>
        </button>
      )}
      <button type="button" onClick={copyLink} className={button}>
        {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} className="text-ribbon-500" />}
        <span>{copied ? "Copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
