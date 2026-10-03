import { Link } from "react-router-dom";
import { Sparkles, Eye, ArrowRight, Heart, Star, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "../store/wishlistStore";
import toast from "react-hot-toast";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductCard({ product, index = 0, onQuickView, onPersonalize }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const isLiked = isInWishlist(product._id || product.id);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      toast.success(`Added "${product.name}" to Wishlist!`, { icon: "❤️" });
    } else {
      toast("Removed from Wishlist", { icon: "🤍" });
    }
  };

  // Mock rating based on product name hash for realism
  const rating = (4.7 + ((product.name.length % 4) * 0.1)).toFixed(1);
  const reviewsCount = 45 + (product.name.length * 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.05 }}
      className="group flex flex-col justify-between h-full bg-white rounded-2xl border border-slate-200/80 hover:border-ribbon-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div>
        {/* Visual Frame & Badges */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Link to={`/product/${product.slug}`} className="block h-full w-full">
            <img
              src={product.images?.[0] || product.image || "/placeholder.jpg"}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Top Left Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.isBestseller && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 shadow-xs border border-rose-100">
                <Sparkles size={10} className="text-amber-500 fill-amber-500" /> Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="inline-flex items-center rounded-md bg-ribbon-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Top Right Wishlist & Quick View */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleWishlistClick}
              aria-label="Wishlist"
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs ${
                isLiked
                  ? "bg-white text-ribbon-500 fill-ribbon-500 shadow-sm"
                  : "bg-white/90 text-slate-400 hover:text-ribbon-500 hover:bg-white"
              }`}
              title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={16} className={isLiked ? "fill-ribbon-500 text-ribbon-500" : ""} />
            </button>

            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-ribbon-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xs"
                title="Quick View"
              >
                <Eye size={15} />
              </button>
            )}
          </div>

          {/* Bottom Overlay Delivery Tag */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            {product.isCustomizable && (
              <span className="rounded-md bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium tracking-wide text-white">
                Personalizable
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-600/90 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-semibold text-white">
              <Zap size={9} className="fill-current" /> Express
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-3.5 pb-1 space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-ribbon-500 text-[10px] truncate max-w-[120px]">
              {product.category?.replace("-", " ")}
            </span>
            <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-800 font-bold text-[10px]">
              <span>{rating}</span>
              <Star size={10} className="fill-emerald-600 text-emerald-600" />
              <span className="text-slate-400 font-normal">({reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-display font-bold text-sm text-slate-900 hover:text-ribbon-500 transition-colors line-clamp-1 block leading-tight"
          >
            {product.name}
          </Link>

          {/* Tagline */}
          <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight">{product.tagline}</p>

          {/* Dynamic Delivery Teaser (IGP Style) */}
          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <Clock size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">
              Earliest: <strong className="text-slate-900 font-semibold">Tomorrow</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Call to Action */}
      <div className="p-3.5 pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-base text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* CTA Action */}
          {onPersonalize && product.isCustomizable ? (
            <button
              onClick={() => onPersonalize(product)}
              className="px-3 py-1.5 rounded-lg bg-ribbon-500 hover:bg-ribbon-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition"
            >
              <span>Personalize</span>
              <ArrowRight size={11} />
            </button>
          ) : (
            <Link
              to={`/product/${product.slug}`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-ribbon-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
            >
              <span>View</span>
              <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
