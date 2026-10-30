import { Link } from "react-router-dom";
import { Sparkles, Eye, ArrowRight, Heart, Star, Zap, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore, productToCartItem } from "../store/cartStore";
import toast from "react-hot-toast";
import { assetUrl } from "../api/client";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ProductCard({ product, index = 0, onQuickView, onPersonalize }) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const isLiked = isInWishlist(product._id || product.id);

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const productId = product._id || product.id;
  const cartItem = items.find(
    (i) => i.productId === productId && !i.customization?.photoUrl && !i.customization?.cuteImageUrl
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isCustomizable && onPersonalize) {
      onPersonalize(product);
      return;
    }
    if (typeof product.stock === "number" && product.stock <= 0) {
      toast.error(`Sorry, "${product.name}" is out of stock`);
      return;
    }
    // Add silently without opening the cart sidebar drawer
    const added = addItem(productToCartItem(product), false);
    if (added !== false) {
      toast.success(`Added "${product.name}" to cart!`, { icon: "🛍️" });
    }
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      if (typeof product.stock === "number" && quantity >= product.stock) {
        toast.error(`Only ${product.stock} available in stock`);
        return;
      }
      updateQuantity(cartItem.id, quantity + 1);
    } else {
      handleAddToCart(e);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    if (quantity <= 1) {
      removeItem(cartItem.id);
      toast("Removed from cart", { icon: "🗑️" });
    } else {
      updateQuantity(cartItem.id, quantity - 1);
    }
  };

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
              src={assetUrl(product.images?.[0] || product.image) || "/images/photo-magnet.webp"}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/images/photo-magnet.webp";
              }}
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
        <div className="p-2.5 sm:p-3 pb-1 space-y-1">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-ribbon-500 text-[10px] truncate max-w-[110px]">
              {product.category?.replace("-", " ")}
            </span>
            {product.rating > 0 && (product.reviewCount > 0 || product.reviewsCount > 0) && (
              <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-800 font-bold text-[10px]">
                <span>{product.rating}</span>
                <Star size={10} className="fill-emerald-600 text-emerald-600" />
                <span className="text-slate-400 font-normal">({product.reviewCount || product.reviewsCount})</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="font-display font-bold text-xs sm:text-sm text-slate-900 hover:text-ribbon-500 transition-colors line-clamp-1 block leading-tight"
          >
            {product.name}
          </Link>

          {/* Tagline */}
          {product.tagline && (
            <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 leading-tight">{product.tagline}</p>
          )}
        </div>
      </div>

      {/* Pricing & Call to Action */}
      <div className="p-2.5 sm:p-3 pt-2 border-t border-slate-100 mt-1">
        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-sm sm:text-base text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* CTA Action */}
          {onPersonalize && product.isCustomizable ? (
            <button
              type="button"
              onClick={() => onPersonalize(product)}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-ribbon-600 hover:bg-ribbon-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition hover:shadow-sm"
            >
              <span>Personalize</span>
              <ArrowRight size={11} />
            </button>
          ) : quantity > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-lg border border-ribbon-200 bg-rose-50/70 p-0.5 shadow-2xs"
            >
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-ribbon-700 hover:bg-ribbon-600 hover:text-white transition shadow-2xs"
              >
                <Minus size={11} className="stroke-[2.5]" />
              </button>
              <span className="min-w-6 text-center text-xs font-bold text-stone-900 px-1">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-md bg-ribbon-600 text-white hover:bg-ribbon-700 transition shadow-2xs"
              >
                <Plus size={11} className="stroke-[2.5]" />
              </button>
            </div>
          ) : typeof product.stock === "number" && product.stock <= 0 ? (
            <span className="px-2 py-1 rounded-lg bg-stone-100 text-stone-400 text-[10px] font-bold uppercase tracking-wider border border-stone-200">
              Sold Out
            </span>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-ribbon-600 hover:bg-ribbon-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition hover:shadow-sm"
            >
              <span>Add</span>
              <Plus size={12} className="stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
