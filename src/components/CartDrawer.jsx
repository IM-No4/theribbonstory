import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { assetUrl } from "../api/client";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="absolute inset-0 bg-espresso-700/40 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-screen max-w-[330px] sm:max-w-[360px] bg-cream-50 shadow-2xl flex flex-col justify-between border-l border-blush-200"
          >
            {/* Header */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-blush-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-ribbon-500" size={17} />
                <h2 className="font-display text-base sm:text-lg text-burgundy-900 font-semibold tracking-tight">Your Story</h2>
                <span className="text-[10px] bg-blush-100/80 text-burgundy-800 font-medium px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? "keepsake" : "keepsakes"}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-full hover:bg-blush-100/70 text-espresso-400 hover:text-burgundy-900 transition-colors"
                aria-label="Close cart"
              >
                <X size={17} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-3.5 sm:px-4 py-3 space-y-2.5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-blush-100 flex items-center justify-center text-ribbon-400 mb-3">
                    <Heart size={28} />
                  </div>
                  <h3 className="font-display text-base text-burgundy-900 mb-1.5 font-semibold">Your keepsake bag is empty</h3>
                  <p className="text-xs text-espresso-400 max-w-xs mb-5">
                    Every keepsake begins with a memory. Explore our collection to craft something special.
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate("/shop");
                    }}
                    className="btn-primary py-2.5 px-5 text-xs rounded-xl"
                  >
                    Start Crafting Keepsakes
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const optionsExtra = (item.selectedOptions || []).reduce((s, o) => s + (Number(o.priceDelta) || 0), 0);
                  const itemPrice = item.price + optionsExtra;
                  const displayNote = item.customization?.note && 
                    !item.customization.note.startsWith("[Category:") && 
                    item.customization.note !== item.customization.customName
                      ? item.customization.note
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-blush-200/70 shadow-2xs flex gap-3 transition-all hover:border-ribbon-300"
                    >
                      {/* Item Thumbnail */}
                      <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-stone-50 border border-stone-200/60 flex items-center justify-center">
                        <img
                          src={assetUrl(item.customization?.cuteImageUrl || item.customization?.reference3D?.approvedPreview || item.image || item.customization?.photoUrl)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="font-display text-xs sm:text-sm text-burgundy-900 font-semibold truncate leading-tight">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-espresso-300 hover:text-ribbon-500 transition-colors p-0.5"
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {(item.customization?.customName || item.customization?.petName) && (
                            <p className="text-[11px] text-burgundy-800 font-medium mt-0.5 truncate">
                              Name: <span className="text-espresso-600 font-normal">{item.customization.customName || item.customization.petName}</span>
                              {item.customization.customDate && <span className="text-espresso-400 font-normal"> · {item.customization.customDate}</span>}
                            </p>
                          )}
                          {displayNote && (
                            <p className="text-[10px] text-espresso-400 line-clamp-1 italic mt-0.5">
                              &quot;{displayNote}&quot;
                            </p>
                          )}
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.selectedOptions.map((o) => (
                                <span key={o.name} className="inline-block text-[9px] text-espresso-500 bg-stone-100/80 px-1.5 py-0.5 rounded leading-tight">
                                  {o.value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-espresso-100/50">
                          <div className="flex items-center rounded-md border border-stone-200 bg-cream-50/80 h-6">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 h-full text-[11px] text-espresso-500 hover:text-burgundy-900 font-bold flex items-center justify-center"
                            >
                              −
                            </button>
                            <span className="px-1.5 text-[11px] font-semibold text-burgundy-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 h-full text-[11px] text-espresso-500 hover:text-burgundy-900 font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-display font-semibold text-burgundy-900 text-xs sm:text-sm">
                            ₹{(itemPrice * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-3.5 sm:p-4 border-t border-blush-200/80 bg-white/90 backdrop-blur-md space-y-2.5">
                <div className="p-2 rounded-lg bg-blush-50/70 border border-blush-200/50 flex items-center gap-2 text-[11px] text-burgundy-800 leading-snug">
                  <Sparkles size={13} className="text-ribbon-500 shrink-0" />
                  <span>Custom crafted with care in our signature ribbon box.</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-espresso-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-espresso-700">₹{subtotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-espresso-400">
                    <span>Pan-India Express Shipping</span>
                    <span className="text-ribbon-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-burgundy-900 pt-1.5 border-t border-espresso-100">
                    <span>Total</span>
                    <span>₹{subtotal().toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeCart();
                    navigate("/checkout");
                  }}
                  className="btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-wide rounded-xl shadow-md group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
