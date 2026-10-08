import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2, X, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { api, assetUrl } from "../api/client";
import toast from "react-hot-toast";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

export default function Cart() {
  const { items, updateQuantity, removeItem, appliedCoupon, setCoupon, removeCoupon } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const discount = appliedCoupon ? appliedCoupon.calculatedDiscount || 0 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponCodeInput.trim(),
        subtotal,
      });
      setCoupon(data);
      toast.success(data.message);
      setCouponCodeInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-blush-100 rounded-3xl flex items-center justify-center mx-auto text-burgundy-900">
          <ShoppingBag size={32} />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-burgundy-900">
          Your keepsake cart is empty
        </h2>
        <p className="text-sm text-espresso-400 max-w-sm mx-auto">
          Add something special for your fridge, living room, or gift celebrations.
        </p>
        <Link to="/shop" className="btn-primary mt-4 inline-flex items-center gap-2">
          <span>Explore Keepsakes</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-burgundy-900">Your Cart</h1>
          <p className="text-xs sm:text-sm text-espresso-400 mt-1">
            {items.length} keepsake{items.length > 1 ? "s" : ""} in your ribbon story
          </p>
        </div>
        <Link to="/shop" className="text-xs font-semibold text-ribbon-600 hover:underline">
          + Add more items
        </Link>
      </div>

      {/* Free Shipping Meter */}
      <div className="p-4 rounded-2xl bg-white border border-blush-200 mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-burgundy-900">
            <Truck size={15} className="text-ribbon-500" />
            {subtotal >= freeShippingThreshold ? (
              <span className="text-emerald-700">🎉 Congratulations! You have unlocked FREE Express Delivery</span>
            ) : (
              <span>Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE Delivery</span>
            )}
          </span>
          <span className="text-espresso-400 font-mono">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-cream-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ribbon-400 to-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
        {/* Items List */}
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item) => {
              const optionsTotal = (item.selectedOptions || []).reduce((s, o) => s + (o.priceDelta || 0), 0);
              const linePrice = (item.price + optionsTotal) * item.quantity;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 sm:p-5 rounded-3xl bg-white border border-blush-200 flex gap-4 sm:gap-6 items-start shadow-xs"
                >
                  <img
                    src={assetUrl(item.image)}
                    alt={item.name}
                    className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl object-cover bg-cream-100 border border-blush-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display text-base sm:text-lg font-bold text-burgundy-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-espresso-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.selectedOptions?.length > 0 && (
                      <p className="mt-1 text-xs text-espresso-500">
                        {item.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" · ")}
                      </p>
                    )}

                    {item.customization?.photoUrl && (
                      <div className="mt-2 flex items-center gap-2 p-1.5 bg-cream-50 rounded-xl border border-blush-100 w-fit">
                        <img
                          src={assetUrl(item.customization.photoUrl)}
                          alt="custom"
                          className="h-7 w-7 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-medium text-ribbon-600">Custom keepsake photo</span>
                      </div>
                    )}

                    {item.customization?.note && (
                      <p className="text-[11px] text-espresso-400 italic mt-1 truncate">
                        &quot;{item.customization.note}&quot;
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border border-espresso-200 bg-cream-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-sm font-bold text-espresso-600 hover:text-burgundy-900 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="px-2 text-xs font-bold text-burgundy-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-sm font-bold text-espresso-600 hover:text-burgundy-900 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-display font-bold text-base text-burgundy-900">
                        {formatPrice(linePrice)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-5 lg:sticky lg:top-24">
            <h3 className="font-display text-xl font-bold text-burgundy-900 border-b border-blush-100 pb-3">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
                Have a Coupon Code?
              </label>
              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-800 font-mono">{appliedCoupon.code}</span>
                      <div className="text-[11px] text-emerald-600">Saved ₹{discount}</div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 text-emerald-700 hover:text-rose-600 cursor-pointer"
                    title="Remove coupon"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" size={14} />
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. RIBBON100"
                      className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-espresso-200 rounded-xl text-xs font-mono font-bold uppercase placeholder-espresso-400 focus:outline-hidden focus:border-ribbon-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="btn-primary !py-2 !px-4 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {validatingCoupon ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-espresso-600 pt-2 border-t border-blush-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-burgundy-900">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="border-t border-blush-200 pt-3 flex justify-between font-display font-bold text-lg text-burgundy-900">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full py-3.5 text-sm font-semibold justify-center flex items-center gap-2 shadow-soft cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-center">
              <Link to="/shop" className="text-xs text-espresso-400 hover:text-ribbon-600 font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
