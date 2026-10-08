import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Heart, X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore, productToCartItem } from "../store/cartStore";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function WishlistDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleMoveToCart = (item) => {
    addItem(productToCartItem(item, 1));
    removeItem(item._id || item.id);
    closeDrawer();
    openCart();
  };

  const handlePersonalize = (item) => {
    closeDrawer();
    navigate(`/product/${item.slug || ""}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDrawer}
          className="absolute inset-0 bg-espresso-700/60 backdrop-blur-xs"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b border-blush-200 bg-cream-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-blush-100 flex items-center justify-center text-ribbon-600">
                  <Heart size={18} className="fill-ribbon-500 text-ribbon-500" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-burgundy-900">
                    My Wishlist ({items.length})
                  </h2>
                  <p className="text-xs text-espresso-400">Your saved gifts and keepsakes</p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full text-espresso-400 hover:text-burgundy-900 hover:bg-blush-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-blush-100 flex items-center justify-center text-ribbon-400">
                    <Heart size={30} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-burgundy-900">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-espresso-400 max-w-xs mx-auto">
                    Heart any product or keepsake you love to save it here for later!
                  </p>
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate("/shop");
                    }}
                    className="btn-primary py-2.5 px-6 text-xs"
                  >
                    Explore Keepsakes
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex gap-3.5 p-3 rounded-2xl border border-espresso-100 bg-cream-50/50 hover:border-ribbon-200 transition-all"
                  >
                    <img
                      src={item.images?.[0] || item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl object-cover border border-blush-200 bg-white"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeDrawer}
                            className="font-display font-semibold text-sm text-burgundy-900 hover:text-ribbon-600 line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item._id || item.id)}
                            className="text-espresso-300 hover:text-red-500 transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] text-espresso-400 line-clamp-1">{item.tagline}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-espresso-100/60 mt-2">
                        <span className="font-display font-bold text-sm text-burgundy-900">
                          {formatPrice(item.price)}
                        </span>

                        {item.isCustomizable ? (
                          <button
                            onClick={() => handlePersonalize(item)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-ribbon-600 hover:text-burgundy-900"
                          >
                            <span>Personalize</span>
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMoveToCart(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-burgundy-900 text-white text-[11px] font-semibold hover:bg-burgundy-800 transition"
                          >
                            <ShoppingBag size={12} />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-blush-200 bg-cream-50/80 space-y-3">
                <button
                  onClick={() => {
                    closeDrawer();
                    navigate("/shop");
                  }}
                  className="btn-primary w-full py-3 text-xs uppercase tracking-wider"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearWishlist}
                  className="w-full text-center text-xs font-medium text-espresso-400 hover:text-red-600 transition"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
