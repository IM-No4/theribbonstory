import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Lock,
  Wallet,
  CreditCard,
  MapPin,
  Tag,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Gift,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const formatPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const emptyAddress = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, appliedCoupon } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const { user, isAuthenticated } = useAuthStore();

  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState(null);

  const [giftOptions, setGiftOptions] = useState({
    isGift: false,
    giftMessage: "",
    cardTheme: "Birthday",
    ribbonColor: "Classic Crimson",
    hideInvoice: true,
  });

  const getMinDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };

  const [deliveryDate, setDeliveryDate] = useState(getMinDeliveryDate());
  const [deliverySlot, setDeliverySlot] = useState("Standard Delivery (3-5 Days)");
  const [shippingEstimate, setShippingEstimate] = useState(null);

  const isMidnight = deliverySlot.includes("Midnight");
  const baseShipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const shipping = baseShipping + (isMidnight ? 199 : 0);
  const discount = appliedCoupon ? appliedCoupon.calculatedDiscount || 0 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // Check Shiprocket Serviceability when Pincode changes
  useEffect(() => {
    const cleanPin = (address.postalCode || "").trim();
    if (cleanPin.length === 6 && !isNaN(cleanPin)) {
      api
        .post("/shipping/check-serviceability", { pincode: cleanPin })
        .then(({ data }) => {
          if (data.serviceable) {
            setShippingEstimate(data);
          }
        })
        .catch(() => {});
    } else {
      setShippingEstimate(null);
    }
  }, [address.postalCode]);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast("Please sign in to proceed with checkout", { icon: "🔒" });
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    if (user) {
      setAddress((a) => ({ ...a, name: user.name || "" }));
      // Fetch user profile to get saved addresses
      api.get("/auth/me").then(({ data }) => {
        const addrs = data.user?.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedSavedIdx(0);
          const first = addrs[0];
          setAddress({
            name: user.name || "",
            line1: first.line1 || "",
            line2: first.line2 || "",
            city: first.city || "",
            state: first.state || "",
            postalCode: first.postalCode || "",
            country: first.country || "India",
            phone: first.phone || "",
          });
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectAddress = (addr, idx) => {
    setSelectedSavedIdx(idx);
    setAddress({
      name: user?.name || address.name,
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      phone: addr.phone || address.phone,
    });
    toast.success(`Selected address: ${addr.label || "Saved Address"}`);
  };

  const buildOrderItems = () =>
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      selectedOptions: i.selectedOptions,
      customization: i.customization,
    }));

  const finalizeOrder = async (paymentResult) => {
    const { data } = await api.post("/orders", {
      items: buildOrderItems(),
      shippingAddress: address,
      paymentMethod,
      paymentResult,
      couponCode: appliedCoupon?.code,
      discountPrice: discount,
      giftOptions: giftOptions.isGift ? giftOptions : undefined,
      scheduledDeliveryDate: deliveryDate,
      deliverySlot,
    });
    clearCart();
    toast.success("Order placed successfully! We're crafting your keepsakes.");
    navigate(`/order-success/${data.order._id}`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!address.line1 || !address.city || !address.postalCode || !address.phone) {
      toast.error("Please fill in full shipping address and contact phone number");
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        await finalizeOrder(undefined);
        return;
      }

      const { data: orderData } = await api.post("/payments/razorpay/order", { amount: total });
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Could not load payment gateway");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: "INR",
        name: "The Ribbon Story",
        description: "Keepsake Order Payment",
        order_id: orderData.order.id,
        prefill: { name: address.name, contact: address.phone, email: user?.email },
        theme: { color: "#a83f52" },
        handler: async (response) => {
          try {
            await finalizeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          } catch (err) {
            toast.error(err.response?.data?.message || "Could not confirm your order");
          } finally {
            setPlacing(false);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        toast.error(resp.error?.description || "Payment was cancelled or failed");
        setPlacing(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to initiate checkout");
      setPlacing(false);
    }
  };

  return (
    <div className="bg-cream-50 min-h-screen py-10 sm:py-14">
      <div className="container-page max-w-5xl">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-burgundy-900 mb-2">
          Checkout & Delivery
        </h1>
        <p className="text-xs sm:text-sm text-espresso-400 mb-8">
          Enter delivery address and choose your payment method.
        </p>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Address & Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            {/* Saved Addresses Picker */}
            {savedAddresses.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-blush-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                  Select Saved Address
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr, idx) => (
                    <button
                      key={addr._id || idx}
                      type="button"
                      onClick={() => selectAddress(addr, idx)}
                      className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                        selectedSavedIdx === idx
                          ? "border-burgundy-900 bg-blush-50/70 shadow-xs font-semibold"
                          : "border-espresso-200/60 bg-cream-50/50 text-espresso-600 hover:border-ribbon-300"
                      }`}
                    >
                      <div className="font-bold text-burgundy-900 flex items-center justify-between">
                        <span>{addr.label || "Address"}</span>
                        {selectedSavedIdx === idx && <Check size={14} className="text-burgundy-900" />}
                      </div>
                      <div className="text-[11px] text-espresso-500 mt-1 truncate">
                        {addr.line1}, {addr.city}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Address Inputs */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-4">
              <h3 className="font-display text-lg font-bold text-burgundy-900 border-b border-blush-100 pb-3 flex items-center gap-2">
                <MapPin size={18} className="text-ribbon-500" />
                <span>Shipping Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    placeholder="Recipient's Name"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="input-field text-xs py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                  Address Line 1 (Flat, House No., Building) *
                </label>
                <input
                  type="text"
                  required
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="e.g. 402, Lotus Apartments, 5th Cross"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                  Address Line 2 (Street, Landmark, Area)
                </label>
                <input
                  type="text"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  placeholder="e.g. Near HDFC Bank, Indiranagar"
                  className="input-field text-xs py-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="input-field text-xs py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    placeholder="6 digits"
                    className="input-field text-xs py-2.5 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Shiprocket Delivery ETA Pill */}
              {shippingEstimate && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <Truck size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      Earliest Delivery: <strong>{shippingEstimate.formattedEDD}</strong> via{" "}
                      {shippingEstimate.recommendedCourier?.courier_name || "BlueDart Air (Shiprocket)"}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Shiprocket Verified
                  </span>
                </div>
              )}
            </div>

            {/* Bespoke Luxury Gifting Options (Gift Message, Custom Card, Ribbon) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-blush-50/40 border border-blush-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-blush-100 pb-3">
                <h3 className="font-display text-lg font-bold text-burgundy-900 flex items-center gap-2">
                  <Gift size={18} className="text-ribbon-500" />
                  <span>Luxury Gift Packaging &amp; Message</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ribbon-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  Complimentary
                </span>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-blush-200 hover:border-ribbon-400 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={giftOptions.isGift}
                  onChange={(e) => setGiftOptions({ ...giftOptions, isGift: e.target.checked })}
                  className="rounded text-burgundy-900 focus:ring-burgundy-900 h-4 w-4"
                />
                <div>
                  <div className="font-bold text-xs text-burgundy-900 flex items-center gap-1.5">
                    <span>This order is a special gift for someone</span>
                    <Sparkles size={12} className="text-amber-500" />
                  </div>
                  <div className="text-[11px] text-espresso-400">
                    Include free handwritten greeting card, satin ribbon knot &amp; conceal prices
                  </div>
                </div>
              </label>

              {giftOptions.isGift && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                        Greeting Card Theme
                      </label>
                      <select
                        value={giftOptions.cardTheme}
                        onChange={(e) => setGiftOptions({ ...giftOptions, cardTheme: e.target.value })}
                        className="input-field text-xs py-2 bg-white"
                      >
                        <option value="Birthday">🎉 Happy Birthday</option>
                        <option value="Anniversary">💍 Happy Anniversary</option>
                        <option value="Romantic / Love">🌹 Pure Love &amp; Forever</option>
                        <option value="Congratulations">✨ Congratulations</option>
                        <option value="Thinking of You">🤍 Thinking of You</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                        Satin Ribbon Color
                      </label>
                      <select
                        value={giftOptions.ribbonColor}
                        onChange={(e) => setGiftOptions({ ...giftOptions, ribbonColor: e.target.value })}
                        className="input-field text-xs py-2 bg-white"
                      >
                        <option value="Classic Crimson">Classic Crimson Red</option>
                        <option value="Rose Gold">Blush &amp; Rose Gold</option>
                        <option value="Royal Emerald">Royal Emerald Green</option>
                        <option value="Champagne Gold">Champagne Warm Gold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                      Personalized Message for Card (Max 250 characters)
                    </label>
                    <textarea
                      rows={3}
                      maxLength={250}
                      value={giftOptions.giftMessage}
                      onChange={(e) => setGiftOptions({ ...giftOptions, giftMessage: e.target.value })}
                      placeholder="e.g. Happy Birthday sweetheart! Here's to making countless more beautiful memories together. Love, Rahul"
                      className="input-field text-xs py-2 leading-relaxed"
                    />
                    <div className="text-right text-[10px] text-espresso-400">
                      {giftOptions.giftMessage.length}/250 characters
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-espresso-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftOptions.hideInvoice}
                      onChange={(e) => setGiftOptions({ ...giftOptions, hideInvoice: e.target.checked })}
                      className="rounded text-burgundy-900 focus:ring-burgundy-900 h-3.5 w-3.5"
                    />
                    <span>Hide invoice and price breakdown from packaging slip</span>
                  </label>
                </motion.div>
              )}
            </div>

            {/* Scheduled Celebration Date & Delivery Time Slot */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-blush-100 pb-3">
                <h3 className="font-display text-lg font-bold text-burgundy-900 flex items-center gap-2">
                  <Calendar size={18} className="text-ribbon-500" />
                  <span>Choose Celebration Delivery Date &amp; Slot</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Guaranteed Arrival
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    Expected Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={getMinDeliveryDate()}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="input-field text-xs py-2.5 bg-white font-medium cursor-pointer"
                  />
                  <p className="text-[10px] text-espresso-400 mt-1">
                    Select your milestone date or earliest arrival.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                    Delivery Time Slot *
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="input-field text-xs py-2.5 bg-white font-medium cursor-pointer"
                  >
                    <option value="Standard Delivery (3-5 Days)">
                      Standard Daytime Slot (9:00 AM - 8:00 PM) (FREE on ₹999+)
                    </option>
                    <option value="Express / Same-Day Slot (9 AM - 9 PM)">
                      Express Priority Dispatch (9:00 AM - 9:00 PM)
                    </option>
                    <option value="Midnight Surprise Delivery (11:00 PM - 12:00 AM)">
                      🌙 Midnight Surprise (11:00 PM - 12:00 AM) (+₹199)
                    </option>
                  </select>
                  <p className="text-[10px] text-espresso-400 mt-1">
                    {isMidnight ? "✨ Includes midnight birthday surprise surcharge" : "Delivered safely with live courier tracking"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-4">
              <h3 className="font-display text-lg font-bold text-burgundy-900 border-b border-blush-100 pb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-ribbon-500" />
                <span>Payment Method</span>
              </h3>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "razorpay"
                      ? "border-burgundy-900 bg-blush-50/60 shadow-xs"
                      : "border-espresso-200/60 hover:border-ribbon-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="text-burgundy-900 focus:ring-burgundy-900"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-burgundy-900">
                        Online Payment (UPI, Cards, NetBanking)
                      </div>
                      <div className="text-[11px] text-espresso-400">
                        Instant confirmation • Fast delivery dispatch
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Recommended
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "cod"
                      ? "border-burgundy-900 bg-blush-50/60 shadow-xs"
                      : "border-espresso-200/60 hover:border-ribbon-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="text-burgundy-900 focus:ring-burgundy-900"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-burgundy-900">
                        Cash on Delivery (COD)
                      </div>
                      <div className="text-[11px] text-espresso-400">Pay cash upon keepsake delivery</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-blush-200 shadow-xl space-y-5 lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-bold text-burgundy-900 border-b border-blush-100 pb-3">
                Review Keepsakes ({items.length})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center text-xs">
                    <img
                      src={assetUrl(item.image)}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-blush-100 bg-cream-50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-burgundy-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-espresso-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className="font-bold text-burgundy-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs text-espresso-600 border-t border-blush-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-burgundy-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(shipping)}
                  </span>
                </div>

                <div className="border-t border-blush-200 pt-3 flex justify-between font-display font-bold text-lg text-burgundy-900">
                  <span>Grand Total</span>
                  <span className="text-ribbon-600 font-mono">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="btn-primary w-full py-4 text-sm font-semibold justify-center flex items-center gap-2 shadow-soft cursor-pointer disabled:opacity-50"
              >
                {placing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Place Order & Pay {formatPrice(total)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-espresso-400">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-bit SSL Encrypted Secure Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
