import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

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
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-cream-50 shadow-2xl flex flex-col justify-between border-l border-blush-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-blush-200 flex items-center justify-between bg-white/70 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="text-ribbon-500" size={20} />
                <h2 className="font-display text-xl text-burgundy-900 font-semibold">Your Story</h2>
                <span className="text-xs bg-blush-100 text-burgundy-800 font-medium px-2.5 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? "keepsake" : "keepsakes"}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-blush-100 text-espresso-400 hover:text-burgundy-900 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <div className="h-20 w-20 rounded-full bg-blush-100 flex items-center justify-center text-ribbon-400 mb-4">
                    <Heart size={36} />
                  </div>
                  <h3 className="font-display text-xl text-burgundy-900 mb-2">Your keepsake bag is empty</h3>
                  <p className="text-sm text-espresso-400 max-w-xs mb-6">
                    Every keepsake begins with a memory. Explore our collection to craft something special.
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate("/shop");
                    }}
                    className="btn-primary"
                  >
                    Start Crafting Keepsakes
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const optionsExtra = (item.selectedOptions || []).reduce((s, o) => s + (Number(o.priceDelta) || 0), 0);
                  const itemPrice = item.price + optionsExtra;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-blush-200/80 shadow-xs flex gap-4 transition-all hover:border-ribbon-300"
                    >
                      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-cream-100 border border-blush-100">
                        <img
                          src={item.customization?.photoUrl || item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        {item.customization?.photoUrl && (
                          <span className="absolute bottom-1 right-1 bg-burgundy-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-medium backdrop-blur-xs">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-base text-burgundy-900 font-semibold truncate">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-espresso-300 hover:text-ribbon-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {item.customization?.petName && (
                            <p className="text-xs text-burgundy-800 font-medium mt-0.5">
                              Name: <span className="text-espresso-600 font-normal">{item.customization.petName}</span>
                            </p>
                          )}
                          {item.customization?.note && (
                            <p className="text-xs text-espresso-400 line-clamp-1 italic mt-0.5">
                              "{item.customization.note}"
                            </p>
                          )}
                          {item.selectedOptions?.map((o) => (
                            <span key={o.name} className="inline-block text-[11px] text-espresso-400 bg-cream-100 px-2 py-0.5 rounded mr-1 mt-1">
                              {o.name}: {o.value}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-espresso-100/50">
                          <div className="flex items-center rounded-lg border border-espresso-200/60 bg-cream-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 py-0.5 text-xs text-espresso-500 hover:text-burgundy-900 font-bold"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-semibold text-burgundy-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-0.5 text-xs text-espresso-500 hover:text-burgundy-900 font-bold"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-display font-semibold text-burgundy-900 text-sm">
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
              <div className="p-6 border-t border-blush-200 bg-white/80 backdrop-blur-md space-y-4">
                <div className="p-3 rounded-xl bg-blush-50 border border-blush-200/60 flex items-center gap-2.5 text-xs text-burgundy-800">
                  <Sparkles size={16} className="text-ribbon-500 shrink-0" />
                  <span>Your keepsake is crafted especially for you. Thoughtfully packaged in our signature ribbon box.</span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-espresso-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-espresso-700">₹{subtotal().toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-espresso-400">
                    <span>Pan-India Express Shipping</span>
                    <span className="text-ribbon-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-burgundy-900 pt-2 border-t border-espresso-100">
                    <span>Total</span>
                    <span>₹{subtotal().toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    closeCart();
                    navigate("/checkout");
                  }}
                  className="btn-primary w-full py-4 text-base shadow-lg group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
