import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
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
  ChevronRight,
  Edit2,
  Building,
  Phone,
  User,
  PackageCheck,
  ArrowRight,
  ShoppingBag,
  Info,
  HeartHandshake,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const formatPrice = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

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
  const { items, clearCart, appliedCoupon, setCoupon, removeCoupon } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const { user, isAuthenticated } = useAuthStore();

  // 3-Step Streamlined Checkout (1: Address, 2: Payment & Gifting, 3: Order Summary & Pay)
  const [activeStep, setActiveStep] = useState(1);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Address State
  const [address, setAddress] = useState(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingAddressToProfile, setSavingAddressToProfile] = useState(false);

  // Shiprocket Logistics State (Calculated automatically)
  const [shippingEstimate, setShippingEstimate] = useState(null);
  const [loadingShiprocket, setLoadingShiprocket] = useState(false);

  // Gifting Option
  const [giftOptions, setGiftOptions] = useState({
    isGift: false,
    giftMessage: "",
    cardTheme: "Birthday",
    ribbonColor: "Classic Crimson",
    hideInvoice: true,
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  // Coupon input in summary
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Dynamic Shipping Calculation from Shiprocket API
  const isFreeDeliveryQualified = subtotal >= 999;
  const shiprocketCourierRate =
    shippingEstimate?.recommendedCourier?.rate ?? (isFreeDeliveryQualified ? 0 : 79);

  const shippingFee = isFreeDeliveryQualified ? 0 : shiprocketCourierRate;
  const discount = appliedCoupon ? appliedCoupon.calculatedDiscount || 0 : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Fetch Shiprocket Serviceability & Courier Rates automatically
  const fetchShiprocketRates = async (pinCode) => {
    const cleanPin = (pinCode || "").trim().replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      setShippingEstimate(null);
      return;
    }

    setLoadingShiprocket(true);
    try {
      const { data } = await api.post("/shipping/check-serviceability", {
        pincode: cleanPin,
        weight: 0.5,
        cod: paymentMethod === "cod" ? 1 : 0,
      });

      if (data?.serviceable) {
        setShippingEstimate(data);
      } else {
        setShippingEstimate(null);
      }
    } catch {
      const fallbackEdd = new Date(Date.now() + 3 * 86400000);
      setShippingEstimate({
        serviceable: true,
        formattedEDD: fallbackEdd.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        recommendedCourier: {
          courier_name: "BlueDart Air Express (Shiprocket)",
          rate: isFreeDeliveryQualified ? 0 : 65,
        },
      });
    } finally {
      setLoadingShiprocket(false);
    }

    // Postal PIN API for City & State auto-fill
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      const postalData = await res.json();
      if (postalData?.[0]?.Status === "Success" && postalData[0].PostOffice?.length > 0) {
        const po = postalData[0].PostOffice[0];
        setAddress((prev) => ({
          ...prev,
          city: prev.city || po.District || po.Division || po.Block || "",
          state: prev.state || po.State || "",
        }));
      }
    } catch {
      // ignore
    }
  };

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
      setAddress((a) => ({ ...a, name: user.name || "", phone: user.phone || "" }));
      api.get("/auth/me").then(({ data }) => {
        const addrs = data.user?.addresses || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedSavedIdx(0);
          const first = addrs[0];
          const newAddr = {
            name: user.name || "",
            line1: first.line1 || "",
            line2: first.line2 || "",
            city: first.city || "",
            state: first.state || "",
            postalCode: first.postalCode || "",
            country: first.country || "India",
            phone: first.phone || user.phone || "",
          };
          setAddress(newAddr);
          if (first.postalCode) {
            fetchShiprocketRates(first.postalCode);
          }
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectSavedAddress = (addr, idx) => {
    setSelectedSavedIdx(idx);
    setIsAddingNew(false);
    const newAddr = {
      name: user?.name || address.name,
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      phone: addr.phone || address.phone,
    };
    setAddress(newAddr);
    if (addr.postalCode) {
      fetchShiprocketRates(addr.postalCode);
    }
    toast.success(`Selected: ${addr.label || "Saved Address"}`);
  };

  const handlePincodeInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setAddress({ ...address, postalCode: val });
    if (val.length === 6) {
      fetchShiprocketRates(val);
    }
  };

  const handleConfirmAddress = async (e) => {
    e?.preventDefault();
    if (!address.name?.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    if (!address.phone?.trim() || address.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit contact phone number");
      return;
    }
    if (!address.line1?.trim()) {
      toast.error("Please enter flat / building / street address");
      return;
    }
    if (!address.city?.trim() || !address.state?.trim()) {
      toast.error("Please enter city and state");
      return;
    }
    if (!address.postalCode?.trim() || address.postalCode.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    if (savingAddressToProfile && isAddingNew) {
      try {
        await api.post("/auth/addresses", {
          label: "Home / Office",
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        });
        toast.success("Address saved to your profile!");
      } catch {
        // ignore
      }
    }

    if (!shippingEstimate) {
      await fetchShiprocketRates(address.postalCode);
    }

    setAddressConfirmed(true);
    setActiveStep(2);
    toast.success("Delivery address confirmed!");
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    setActiveStep(3);
    toast.success("Proceeding to final order summary!");
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    setApplyingCoupon(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponInput.trim(),
        subtotal,
      });
      setCoupon(data);
      toast.success(data.message || "Coupon applied successfully!");
      setCouponInput("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const buildOrderItems = () =>
    items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      selectedOptions: i.selectedOptions,
      customization: i.customization,
    }));

  const finalizeOrder = async (paymentResult) => {
    const courierName =
      shippingEstimate?.recommendedCourier?.courier_name ||
      "BlueDart Air Express (Shiprocket)";

    const { data } = await api.post("/orders", {
      items: buildOrderItems(),
      shippingAddress: address,
      shippingPrice: shippingFee,
      courierPartner: courierName,
      paymentMethod,
      paymentResult,
      couponCode: appliedCoupon?.code,
      discountPrice: discount,
      giftOptions: giftOptions.isGift ? giftOptions : undefined,
    });

    clearCart();
    toast.success("Order placed successfully! We're crafting your keepsakes.");
    navigate(`/order-success/${data.order._id}`);
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (!address.line1 || !address.city || !address.postalCode || !address.phone) {
      toast.error("Please complete delivery address first");
      setActiveStep(1);
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        await finalizeOrder(undefined);
        return;
      }

      // Razorpay Payment Flow
      const { data: orderData } = await api.post("/payments/razorpay/order", { amount: total });
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Could not load payment gateway script");

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: "INR",
        name: "The Ribbon Story",
        description: "Artisan Keepsake Order Payment",
        order_id: orderData.order.id,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email,
        },
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
    <div className="bg-[#FAF7F5] min-h-screen py-8 sm:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Stepper */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ribbon-600 uppercase tracking-widest mb-1">
              <Lock size={14} className="text-emerald-600" />
              <span>Secure SSL 256-bit Encrypted Checkout</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-burgundy-900 tracking-tight">
              Checkout &amp; Express Fulfillment
            </h1>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeStep === 1
                  ? "bg-burgundy-900 text-white shadow-xs"
                  : addressConfirmed
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-white text-espresso-400 border border-slate-200"
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">
                {addressConfirmed && activeStep !== 1 ? <Check size={11} className="stroke-[3]" /> : "1"}
              </span>
              <span>1. Address</span>
            </button>

            <ChevronRight size={13} className="text-espresso-300" />

            {/* Step 2 Pill */}
            <button
              type="button"
              disabled={!addressConfirmed}
              onClick={() => addressConfirmed && setActiveStep(2)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                activeStep === 2
                  ? "bg-burgundy-900 text-white shadow-xs cursor-pointer"
                  : paymentConfirmed
                  ? "bg-emerald-100 text-emerald-800 cursor-pointer"
                  : "bg-white text-espresso-400 border border-slate-200 disabled:opacity-50"
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">
                {paymentConfirmed && activeStep !== 2 ? <Check size={11} className="stroke-[3]" /> : "2"}
              </span>
              <span>2. Payment &amp; Gift Options</span>
            </button>

            <ChevronRight size={13} className="text-espresso-300" />

            {/* Step 3 Pill */}
            <button
              type="button"
              disabled={!paymentConfirmed}
              onClick={() => paymentConfirmed && setActiveStep(3)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                activeStep === 3
                  ? "bg-ribbon-600 text-white shadow-md ring-2 ring-ribbon-300 cursor-pointer"
                  : "bg-white text-espresso-400 border border-slate-200 disabled:opacity-50"
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/20">
                3
              </span>
              <span>3. Order Summary &amp; Pay</span>
            </button>
          </div>
        </div>

        {/* 2-Column Wide Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Stepped Accordions */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* ================= STEP 1: DELIVERY ADDRESS ================= */}
            <div className="rounded-3xl bg-white border border-rose-100 shadow-sm overflow-hidden transition-all duration-300">
              <div
                className={`p-5 sm:p-6 flex items-center justify-between border-b ${
                  activeStep === 1 ? "border-rose-100 bg-rose-50/20" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold ${
                      addressConfirmed
                        ? "bg-emerald-600 text-white"
                        : activeStep === 1
                        ? "bg-burgundy-900 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {addressConfirmed ? <Check size={16} /> : "1"}
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-burgundy-900 flex items-center gap-2">
                      <MapPin size={18} className="text-ribbon-500" />
                      <span>1. Delivery Address</span>
                    </h2>
                    <p className="text-[11px] text-espresso-400">
                      Where should we deliver your handcrafted keepsakes?
                    </p>
                  </div>
                </div>

                {activeStep !== 1 && addressConfirmed && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ribbon-600 hover:text-ribbon-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full transition cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep === 1 ? (
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Saved Addresses Selector */}
                  {savedAddresses.length > 0 && !isAddingNew && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                          Select a Saved Address
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(true);
                            setSelectedSavedIdx(null);
                            setAddress({
                              name: user?.name || "",
                              line1: "",
                              line2: "",
                              city: "",
                              state: "",
                              postalCode: "",
                              country: "India",
                              phone: user?.phone || "",
                            });
                          }}
                          className="text-xs font-bold text-ribbon-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>+ Add New Address</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {savedAddresses.map((addr, idx) => (
                          <div
                            key={addr._id || idx}
                            onClick={() => selectSavedAddress(addr, idx)}
                            className={`p-4 rounded-2xl border text-left text-xs transition cursor-pointer relative ${
                              selectedSavedIdx === idx
                                ? "border-burgundy-900 bg-blush-50/70 shadow-xs ring-1 ring-burgundy-900/20"
                                : "border-slate-200 bg-white hover:border-ribbon-300"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-burgundy-900 mb-1">
                              <span className="flex items-center gap-1.5">
                                <Building size={14} className="text-ribbon-500" />
                                {addr.label || "Address"}
                              </span>
                              {selectedSavedIdx === idx && (
                                <span className="w-5 h-5 rounded-full bg-burgundy-900 text-white flex items-center justify-center">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-800 truncate">{addr.name || user?.name}</div>
                            <div className="text-[11px] text-espresso-500 line-clamp-2 mt-0.5">
                              {addr.line1}, {addr.line2 && `${addr.line2}, `}
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </div>
                            <div className="text-[11px] font-mono text-espresso-400 mt-2 flex items-center gap-1">
                              <Phone size={11} />
                              <span>{addr.phone || user?.phone || "No phone"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Input Form */}
                  {(isAddingNew || savedAddresses.length === 0) && (
                    <form onSubmit={handleConfirmAddress} className="space-y-4">
                      {savedAddresses.length > 0 && (
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-burgundy-900 uppercase">
                            Enter New Shipping Address
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNew(false);
                              if (savedAddresses.length > 0) {
                                selectSavedAddress(savedAddresses[0], 0);
                              }
                            }}
                            className="text-xs text-espresso-500 hover:text-burgundy-900 underline cursor-pointer"
                          >
                            Cancel &amp; Use Saved Address
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                            Recipient Full Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={address.name}
                              onChange={(e) => setAddress({ ...address, name: e.target.value })}
                              placeholder="e.g. Priyanshi Sharma"
                              className="input-field text-xs py-3 pl-9"
                            />
                            <User size={14} className="absolute left-3 top-3.5 text-espresso-300" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                            Contact Phone Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              value={address.phone}
                              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                              placeholder="10-digit mobile number"
                              className="input-field text-xs py-3 pl-9 font-mono"
                            />
                            <Phone size={14} className="absolute left-3 top-3.5 text-espresso-300" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                          Address Line 1 (Flat, House No., Building Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={address.line1}
                          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                          placeholder="e.g. Flat 402, Signature Palms, 8th Main"
                          className="input-field text-xs py-3"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                          Address Line 2 (Street, Landmark, Locality)
                        </label>
                        <input
                          type="text"
                          value={address.line2}
                          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                          placeholder="e.g. Near Indiranagar Metro Station"
                          className="input-field text-xs py-3"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                            Pincode *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={address.postalCode}
                              onChange={handlePincodeInput}
                              placeholder="6 digits"
                              className="input-field text-xs py-3 font-mono font-bold tracking-wider"
                            />
                            {loadingShiprocket && (
                              <Loader2
                                size={14}
                                className="animate-spin absolute right-3 top-3.5 text-ribbon-500"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            placeholder="e.g. Bengaluru"
                            className="input-field text-xs py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1.5">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            placeholder="e.g. Karnataka"
                            className="input-field text-xs py-3"
                          />
                        </div>
                      </div>

                      {isAddingNew && (
                        <label className="flex items-center gap-2 text-xs text-espresso-600 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={savingAddressToProfile}
                            onChange={(e) => setSavingAddressToProfile(e.target.checked)}
                            className="rounded text-burgundy-900 focus:ring-burgundy-900 h-4 w-4"
                          />
                          <span>Save this address for fast 1-click checkout in future</span>
                        </label>
                      )}
                    </form>
                  )}

                  {/* Shiprocket Live Serviceability Pill */}
                  {shippingEstimate && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-emerald-950 font-semibold">
                        <Truck size={17} className="text-emerald-700 shrink-0" />
                        <span>
                          Shiprocket Express Delivery: Estimated arrival by{" "}
                          <strong className="text-emerald-800">{shippingEstimate.formattedEDD}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                        {isFreeDeliveryQualified ? "FREE Express" : "PIN Serviceable"}
                      </span>
                    </motion.div>
                  )}

                  {/* Confirm Address Button */}
                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleConfirmAddress}
                      disabled={loadingShiprocket}
                      className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                    >
                      {loadingShiprocket ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Checking Shiprocket...</span>
                        </>
                      ) : (
                        <>
                          <span>Deliver to this Address</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Collapsed Address View */
                <div className="p-5 sm:p-6 bg-cream-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-espresso-700">
                  <div className="space-y-1">
                    <div className="font-bold text-burgundy-900 text-sm flex items-center gap-2">
                      <span>{address.name}</span>
                      <span className="text-[10px] font-mono bg-blush-100 text-burgundy-900 px-2 py-0.5 rounded-full">
                        +91 {address.phone}
                      </span>
                    </div>
                    <div className="text-espresso-600">
                      {address.line1}, {address.line2 && `${address.line2}, `}
                      {address.city}, {address.state} - <strong className="font-mono">{address.postalCode}</strong>
                    </div>
                  </div>

                  {shippingEstimate && (
                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-emerald-800">
                      <div className="text-[11px] font-semibold flex items-center gap-1 justify-end">
                        <Truck size={13} />
                        <span>Shiprocket Express</span>
                      </div>
                      <div className="text-[10px] text-espresso-500">ETA: {shippingEstimate.formattedEDD}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ================= STEP 2: PAYMENT METHOD & GIFT OPTIONS ================= */}
            <div
              className={`rounded-3xl bg-white border border-rose-100 shadow-sm overflow-hidden transition-all duration-300 ${
                !addressConfirmed ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              <div
                className={`p-5 sm:p-6 flex items-center justify-between border-b ${
                  activeStep === 2 ? "border-rose-100 bg-rose-50/20" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold ${
                      paymentConfirmed
                        ? "bg-emerald-600 text-white"
                        : activeStep === 2
                        ? "bg-burgundy-900 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {paymentConfirmed ? <Check size={16} /> : "2"}
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-burgundy-900 flex items-center gap-2">
                      <CreditCard size={18} className="text-ribbon-500" />
                      <span>2. Payment &amp; Gift Options</span>
                    </h2>
                    <p className="text-[11px] text-espresso-400">
                      Choose payment method and personalize your luxury gift greeting card
                    </p>
                  </div>
                </div>

                {activeStep !== 2 && paymentConfirmed && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ribbon-600 hover:text-ribbon-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full transition cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Change</span>
                  </button>
                )}
              </div>

              {activeStep === 2 && (
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                      Select Payment Method
                    </span>

                    {/* Razorpay Online Payment */}
                    <label
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === "razorpay"
                          ? "border-burgundy-900 bg-rose-50/40 shadow-xs ring-1 ring-burgundy-900/20"
                          : "border-slate-200 hover:border-ribbon-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                          className="text-burgundy-900 focus:ring-burgundy-900 h-4 w-4"
                        />
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-burgundy-900 flex items-center gap-2">
                            <span>Online Payment (UPI, Cards, NetBanking, Wallets)</span>
                          </div>
                          <div className="text-[11px] text-espresso-400">
                            Instant Razorpay gateway • Priority workshop crafting &amp; dispatch
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Recommended
                      </span>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === "cod"
                          ? "border-burgundy-900 bg-rose-50/40 shadow-xs ring-1 ring-burgundy-900/20"
                          : "border-slate-200 hover:border-ribbon-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="text-burgundy-900 focus:ring-burgundy-900 h-4 w-4"
                        />
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-burgundy-900">
                            Cash on Delivery (COD)
                          </div>
                          <div className="text-[11px] text-espresso-400">
                            Pay in cash or UPI QR code at your doorstep upon package arrival
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Prominent Luxury Gift Packaging & Greeting Card Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/50 via-white to-blush-50/50 border border-rose-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm text-burgundy-900">
                        <Gift size={18} className="text-ribbon-500" />
                        <span>Gift Packaging &amp; Personalized Greeting Card</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ribbon-600 bg-white border border-rose-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        100% Free / Complimentary
                      </span>
                    </div>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-rose-200/90 hover:border-ribbon-400 cursor-pointer transition shadow-2xs">
                      <input
                        type="checkbox"
                        checked={giftOptions.isGift}
                        onChange={(e) => setGiftOptions({ ...giftOptions, isGift: e.target.checked })}
                        className="rounded text-burgundy-900 focus:ring-burgundy-900 h-4.5 w-4.5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-xs text-burgundy-900 flex items-center gap-1.5">
                          <span>Yes, this order is a gift for someone special</span>
                          <Sparkles size={13} className="text-amber-500" />
                        </div>
                        <div className="text-[11px] text-espresso-500 mt-0.5 leading-relaxed">
                          Include free printed greeting card, satin ribbon box &amp; conceal prices on packing slip
                        </div>
                      </div>
                    </label>

                    {/* Expandable Gift Details */}
                    {giftOptions.isGift && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4 pt-1"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                              Greeting Card Theme
                            </label>
                            <select
                              value={giftOptions.cardTheme}
                              onChange={(e) => setGiftOptions({ ...giftOptions, cardTheme: e.target.value })}
                              className="input-field text-xs py-2.5 bg-white font-medium"
                            >
                              <option value="Birthday">🎉 Happy Birthday</option>
                              <option value="Anniversary">💍 Happy Anniversary</option>
                              <option value="Romantic / Love">🌹 Pure Love &amp; Forever</option>
                              <option value="Congratulations">✨ Congratulations</option>
                              <option value="Thinking of You">🤍 Thinking of You</option>
                              <option value="Thank You">🙏 Thank You So Much</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                              Satin Ribbon Knot Color
                            </label>
                            <select
                              value={giftOptions.ribbonColor}
                              onChange={(e) => setGiftOptions({ ...giftOptions, ribbonColor: e.target.value })}
                              className="input-field text-xs py-2.5 bg-white font-medium"
                            >
                              <option value="Classic Crimson">Classic Crimson Red</option>
                              <option value="Rose Gold">Blush &amp; Rose Gold</option>
                              <option value="Royal Emerald">Royal Emerald Green</option>
                              <option value="Champagne Gold">Champagne Warm Gold</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-burgundy-900 uppercase">
                              Personalized Message for Greeting Card
                            </label>
                            <span className="text-[10px] font-mono text-espresso-400">
                              {giftOptions.giftMessage.length}/250 chars
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            maxLength={250}
                            value={giftOptions.giftMessage}
                            onChange={(e) => setGiftOptions({ ...giftOptions, giftMessage: e.target.value })}
                            placeholder="e.g. Happy Birthday sweetheart! To endless memories and unconditional love. With love, Priya"
                            className="input-field text-xs py-2.5 leading-relaxed"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-xs text-espresso-600 cursor-pointer pt-0.5">
                          <input
                            type="checkbox"
                            checked={giftOptions.hideInvoice}
                            onChange={(e) => setGiftOptions({ ...giftOptions, hideInvoice: e.target.checked })}
                            className="rounded text-burgundy-900 focus:ring-burgundy-900 h-3.5 w-3.5"
                          />
                          <span>Hide pricing &amp; invoice breakdown from package delivery slip</span>
                        </label>
                      </motion.div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      className="btn-primary py-3.5 px-8 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2"
                    >
                      <span>Review Order Summary</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsed Step 2 Summary */}
              {activeStep !== 2 && paymentConfirmed && (
                <div className="p-5 sm:p-6 bg-cream-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-espresso-700">
                  <div>
                    <div className="font-bold text-burgundy-900">
                      {paymentMethod === "razorpay"
                        ? "Online Payment via Razorpay (UPI, Cards, NetBanking)"
                        : "Cash on Delivery (COD)"}
                    </div>
                    <div className="text-espresso-400 text-[11px]">
                      {paymentMethod === "razorpay" ? "Prepaid Instant Dispatch" : "Pay at doorstep"}
                    </div>
                  </div>

                  {giftOptions.isGift && (
                    <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-ribbon-700">
                      <div className="text-[11px] font-semibold flex items-center gap-1 justify-end">
                        <Gift size={13} />
                        <span>Gift Card ({giftOptions.cardTheme})</span>
                      </div>
                      <div className="text-[10px] text-espresso-400 truncate max-w-[200px]">
                        Ribbon: {giftOptions.ribbonColor}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ================= STEP 3: REVIEW ITEMS & FINAL CONFIRMATION ================= */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white border border-rose-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6"
              >
                <div className="border-b border-rose-100 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-ribbon-500 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-burgundy-900">
                        Review Keepsakes &amp; Place Order
                      </h2>
                      <p className="text-xs text-espresso-400">
                        Verify your delivery destination and keepsakes before final payment
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Ready to Pay
                  </span>
                </div>

                {/* Gift Option Confirmation Badge in Review */}
                {giftOptions.isGift ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-blush-50 to-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Gift size={16} className="text-ribbon-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-burgundy-900">
                          Complimentary Gift Packaging Included ({giftOptions.cardTheme} Card)
                        </div>
                        {giftOptions.giftMessage && (
                          <div className="text-[11px] text-espresso-600 italic mt-1 bg-white/70 p-2 rounded-xl border border-rose-100">
                            &ldquo;{giftOptions.giftMessage}&rdquo;
                          </div>
                        )}
                        <div className="text-[10px] text-espresso-400 mt-1">
                          Ribbon: {giftOptions.ribbonColor} • Invoice concealed from recipient
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="text-[11px] font-bold text-ribbon-600 hover:underline shrink-0 cursor-pointer"
                    >
                      Edit Gift
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-cream-50/70 border border-rose-100 flex items-center justify-between text-xs">
                    <span className="text-espresso-500 text-[11px]">
                      Sending as a gift? Add a free printed greeting card &amp; ribbon.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setGiftOptions((g) => ({ ...g, isGift: true }));
                        setActiveStep(2);
                      }}
                      className="text-xs font-bold text-ribbon-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add Gift Card</span>
                    </button>
                  </div>
                )}

                {/* Keepsakes Items Grid Preview */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                    Your Keepsake Items ({items.length})
                  </span>
                  <div className="divide-y divide-rose-50 border border-rose-100 rounded-2xl overflow-hidden bg-cream-50/30">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={assetUrl(item.image)}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover border border-rose-100 bg-white shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-burgundy-900 text-sm truncate">{item.name}</h4>
                            <div className="text-espresso-500 text-[11px] mt-0.5">
                              Quantity: <strong className="font-mono">{item.quantity}</strong> × {formatPrice(item.price)}
                            </div>
                            {item.customization?.note && (
                              <div className="text-[10px] text-ribbon-700 italic truncate mt-0.5">
                                Note: &ldquo;{item.customization.note}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-mono font-bold text-burgundy-900 text-sm shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Order Confirmation Call To Action */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50/60 via-cream-50/60 to-blush-50/60 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-espresso-500">By clicking below, you agree to The Ribbon Story terms:</div>
                    <div className="text-sm font-bold text-burgundy-900">
                      Total Payable Amount: <span className="text-ribbon-600 font-mono text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-primary py-4 px-8 text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>
                          {paymentMethod === "cod"
                            ? `Place Order via COD (${formatPrice(total)})`
                            : `Pay ${formatPrice(total)} via Razorpay`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 xl:col-span-4">
            {activeStep === 3 ? (
              /* ACTIVE FINAL ORDER SUMMARY CARD (ON STEP 3) */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky top-24 rounded-3xl bg-white border border-rose-200 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-rose-100 bg-gradient-to-br from-rose-50/40 via-white to-blush-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ribbon-600">
                        Final Step 3
                      </span>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-burgundy-900">
                        Order Summary
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {items.length} keepsake{items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Promo Coupon Box */}
                <div className="p-5 border-b border-slate-100 space-y-2">
                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                        <Tag size={14} className="text-emerald-600" />
                        <span>
                          Code <strong>{appliedCoupon.code}</strong> Applied (-{formatPrice(discount)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter Promo Coupon"
                          className="input-field text-xs py-2.5 pl-8 uppercase font-mono"
                        />
                        <Tag size={13} className="absolute left-2.5 top-3 text-espresso-300" />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-burgundy-900 hover:bg-burgundy-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                      >
                        {applyingCoupon ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Detailed Price Breakdown */}
                <div className="p-5 sm:p-6 space-y-3 text-xs text-espresso-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-medium font-mono text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span className="font-mono">- {formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <span>Shiprocket Delivery</span>
                      {shippingEstimate && (
                        <span className="block text-[10px] text-espresso-400">
                          Estimated ETA: {shippingEstimate.formattedEDD}
                        </span>
                      )}
                    </div>
                    <span className="font-medium font-mono">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          FREE
                        </span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {giftOptions.isGift && (
                    <div className="flex justify-between text-ribbon-700">
                      <span>Luxury Gift Packaging &amp; Card</span>
                      <span className="font-bold text-emerald-700">FREE</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="border-t border-rose-100 pt-4 flex justify-between items-baseline font-display">
                    <span className="text-base font-bold text-burgundy-900">Grand Total</span>
                    <span className="text-2xl font-bold text-ribbon-600 font-mono">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Place Order CTA Button */}
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-wider justify-center flex items-center gap-2 shadow-soft cursor-pointer disabled:opacity-50"
                    >
                      {placing ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          <span>Processing Order...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>
                            {paymentMethod === "cod"
                              ? `Confirm COD (${formatPrice(total)})`
                              : `Pay ${formatPrice(total)} Now`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-espresso-400 pt-2">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>256-bit Encrypted • 100% Secure Checkout</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* PROGRESS HELPER SIDEBAR (STEPS 1, 2) */
              <div className="sticky top-24 rounded-3xl bg-white border border-rose-100 shadow-sm p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1">
                    <ShoppingBag size={15} className="text-ribbon-500" />
                    <span>Your Keepsake Bag</span>
                  </div>
                  <p className="text-xs text-espresso-400">
                    {items.length} item{items.length > 1 ? "s" : ""} in cart • Order summary will appear in Step 3
                  </p>
                </div>

                {/* Items Thumbnails */}
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={assetUrl(item.image)}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-rose-100 bg-cream-50 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-burgundy-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-espresso-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-800">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free Shipping Meter */}
                <div className="p-3.5 rounded-2xl bg-cream-50/80 border border-rose-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-burgundy-900 text-[11px]">
                      <Truck size={14} className="text-ribbon-500" />
                      {subtotal >= 999 ? (
                        <span className="text-emerald-700">FREE Express Delivery Unlocked!</span>
                      ) : (
                        <span>Add {formatPrice(999 - subtotal)} for FREE Delivery</span>
                      )}
                    </span>
                    <span className="text-espresso-400 font-mono text-[10px]">
                      {Math.min(100, Math.round((subtotal / 999) * 100))}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ribbon-400 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Next Step Guidance Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/30 to-blush-50/40 border border-rose-100 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-burgundy-900">
                    <Info size={14} className="text-ribbon-600" />
                    <span>
                      {activeStep === 1
                        ? "Current Step: Delivery Address"
                        : "Current Step: Payment & Gift Options"}
                    </span>
                  </div>
                  <p className="text-[11px] text-espresso-500">
                    {activeStep === 1
                      ? "Enter your delivery PIN code and address. Real-time courier delivery fee and ETA will be calculated automatically."
                      : "Select your payment method and personalize your free gift greeting card message if this order is a gift."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-espresso-400">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>100% Handcrafted Artisan Guarantee</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
