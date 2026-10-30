import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  CreditCard,
  MapPin,
  Tag,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Gift,
  Sparkles,
  ChevronRight,
  Edit2,
  Building,
  Phone,
  User,
  ArrowRight,
  ShoppingBag,
  Info,
  Receipt,
  Trash2,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import { useCartStore, isCustomKeepsakeItem, WEEKLY_KEEPSAKE_THRESHOLD } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useLocationStore } from "../store/locationStore";
import { useSeo } from "../utils/seo";

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

const emptyBillingAddress = {
  name: "",
  company: "",
  gstin: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  phone: "",
};

export default function Checkout() {
  useSeo({ title: "Checkout", noindex: true });
  const navigate = useNavigate();
  const {
    items,
    clearCart,
    updateQuantity,
    removeItem,
    appliedCoupon,
    setCoupon,
    removeCoupon,
  } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const { user, isAuthenticated } = useAuthStore();

  // Custom 3D Keepsakes weekly threshold & COD restriction
  const totalKeepsakesInCart = items
    .filter(isCustomKeepsakeItem)
    .reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const hasCustomKeepsake = totalKeepsakesInCart > 0;
  const isKeepsakeThresholdReached = totalKeepsakesInCart >= WEEKLY_KEEPSAKE_THRESHOLD;

  // Address State & Modal Control
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState(emptyBillingAddress);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedIdx, setSelectedSavedIdx] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingAddressToProfile, setSavingAddressToProfile] = useState(false);

  const isAddressValid = Boolean(
    address.name?.trim() &&
    address.phone?.trim() &&
    address.phone.replace(/\D/g, "").length >= 10 &&
    address.line1?.trim() &&
    address.city?.trim() &&
    address.state?.trim() &&
    address.postalCode?.trim() &&
    address.postalCode.length === 6
  );

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

  // Automatically reset to prepaid razorpay if cart has custom keepsakes
  useEffect(() => {
    if (hasCustomKeepsake && paymentMethod === "cod") {
      setPaymentMethod("razorpay");
    }
  }, [hasCustomKeepsake, paymentMethod]);

  // Coupon input in summary
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    api.get("/coupons/available")
      .then(({ data }) => setAvailableCoupons(data.coupons || []))
      .catch(() => {});
  }, []);

  // Dynamic Shipping Calculation & Single Printer Queue Option
  const [selectedDeliveryTier, setSelectedDeliveryTier] = useState("standard"); // "standard" | "express"
  const isFreeDeliveryQualified = subtotal >= 999;
  const baseShippingFee = isFreeDeliveryQualified ? 0 : 99;
  const expressPriorityFee = selectedDeliveryTier === "express" ? 199 : 0;
  const shippingFee = baseShippingFee + expressPriorityFee;
  const discount = appliedCoupon ? appliedCoupon.calculatedDiscount || 0 : 0;
  const total = Math.max(0, subtotal + shippingFee - discount);

  // Fetch Shiprocket Serviceability, Printer Queue & Delivery Options
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
        items,
        weight: 0.5,
        cod: (!hasCustomKeepsake && paymentMethod === "cod") ? 1 : 0,
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
          courier_name: "Express Air Delivery",
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
        } else {
          // No saved addresses -> auto-populate from consistent pincode
          const storedPin =
            localStorage.getItem("ribbon_delivery_pincode") ||
            useLocationStore.getState().location?.pincode ||
            "";
          if (storedPin && /^\d{6}$/.test(storedPin)) {
            setAddress((prev) => ({ ...prev, postalCode: storedPin }));
            fetchShiprocketRates(storedPin);
          }
        }
      });
    } else {
      // Guest user -> auto-populate from consistent pincode
      const storedPin =
        localStorage.getItem("ribbon_delivery_pincode") ||
        useLocationStore.getState().location?.pincode ||
        "";
      if (storedPin && /^\d{6}$/.test(storedPin)) {
        setAddress((prev) => ({ ...prev, postalCode: storedPin }));
        fetchShiprocketRates(storedPin);
      }
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
      try {
        localStorage.setItem("ribbon_delivery_pincode", addr.postalCode);
        useLocationStore.getState().setPincode(addr.postalCode);
      } catch {}
      fetchShiprocketRates(addr.postalCode);
    }
    toast.success(`Selected: ${addr.label || "Saved Address"}`);
  };

  const handlePincodeInput = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setAddress({ ...address, postalCode: val });
    if (val.length === 6) {
      try {
        localStorage.setItem("ribbon_delivery_pincode", val);
        useLocationStore.getState().setPincode(val);
      } catch {}
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

    if (!sameAsShipping) {
      if (!billingAddress.name?.trim()) {
        toast.error("Please enter billing contact name");
        return;
      }
      if (!billingAddress.line1?.trim()) {
        toast.error("Please enter billing address line 1");
        return;
      }
      if (!billingAddress.city?.trim() || !billingAddress.state?.trim()) {
        toast.error("Please enter billing city and state");
        return;
      }
      if (!billingAddress.postalCode?.trim() || billingAddress.postalCode.length !== 6) {
        toast.error("Please enter a valid 6-digit PIN code for billing address");
        return;
      }
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

    setIsAddressModalOpen(false);
    toast.success("Delivery address updated!");
  };

  const handleApplyCouponCode = async (codeToApply) => {
    const cleanCode = (codeToApply || "").trim().toUpperCase();
    if (!cleanCode) return;
    setApplyingCoupon(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: cleanCode,
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

  const handleApplyCoupon = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!couponInput.trim()) {
      toast.error("Please enter a promo code");
      return;
    }
    await handleApplyCouponCode(couponInput);
  };

  const buildOrderItems = () =>
    items.map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image,
      sizeId: i.sizeId || i.customization?.size || "small",
      price: i.price,
      hamper: i.hamper,
      quantity: i.quantity,
      selectedOptions: i.selectedOptions,
      customization: i.customization,
    }));

  // Everything the server needs to price and save the order
  const buildOrderPayload = () => ({
    items: buildOrderItems(),
    shippingAddress: address,
    billingAddress: sameAsShipping ? address : billingAddress,
    deliverySlot:
      selectedDeliveryTier === "express"
        ? shippingEstimate?.express?.slotName || "⚡ Express Priority Delivery"
        : shippingEstimate?.standard?.slotName || "Standard Delivery",
    courierPartner:
      selectedDeliveryTier === "express"
        ? shippingEstimate?.express?.courierName || "Priority Air Delivery"
        : shippingEstimate?.standard?.courierName || "Standard Delivery",
    couponCode: appliedCoupon?.code,
    giftOptions: giftOptions.isGift ? giftOptions : undefined,
  });

  const completeOrder = (orderId) => {
    clearCart();
    toast.success("Order placed successfully! We're crafting your keepsakes.");
    navigate(`/order-success/${orderId}`);
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();

    if (!isAddressValid) {
      setIsAddressModalOpen(true);
      toast("Please enter your delivery address to complete checkout", { icon: "📍" });
      return;
    }

    if (!sameAsShipping && (!billingAddress.line1 || !billingAddress.city || !billingAddress.postalCode)) {
      setIsAddressModalOpen(true);
      toast.error("Please complete billing address");
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        if (hasCustomKeepsake) {
          toast.error("Cash on Delivery is not available for custom keepsake orders. Please complete payment online.");
          setPaymentMethod("razorpay");
          setPlacing(false);
          return;
        }
        const { data } = await api.post("/orders", { ...buildOrderPayload(), paymentMethod: "cod" });
        completeOrder(data.order._id);
        return;
      }

      // Razorpay
      const { data: orderData } = await api.post("/payments/razorpay/order", buildOrderPayload());
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
            await api.post(`/orders/${orderData.orderId}/confirm-payment`, response);
            completeOrder(orderData.orderId);
          } catch (err) {
            if (err.response?.status === 400) {
              toast.error(err.response.data?.message || "Could not confirm your payment");
            } else {
              toast.success("Payment received! Your order confirmation will follow shortly.");
              completeOrder(orderData.orderId);
            }
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
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
    <div className="bg-[#FAF7F5] min-h-screen py-3 sm:py-4">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header - Compact & Sleek */}
        <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-rose-100/80">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-burgundy-900 tracking-tight">
              Checkout
            </h1>
            <span className="text-xs text-espresso-400 hidden sm:inline">
              Review your delivery address, payment method, and keepsake items
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Lock size={12} className="text-emerald-600" />
            <span>SSL 256-bit Encrypted</span>
          </div>
        </div>

        {/* 2-Column Wide Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3.5">
            {/* ROW 1: 2 Side-by-Side Cards (Address & Payment) - Mobile Order: 2nd & 3rd, Desktop: 1st */}
            <div className="order-2 md:order-1 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Card 1: Delivery Address */}
              <div className="rounded-2xl bg-white border border-rose-100/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between transition-all hover:border-rose-200">
                {isAddressValid ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-rose-100/70 mb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-burgundy-900">
                          <MapPin size={15} className="text-ribbon-600 shrink-0" />
                          <span>Delivery Address</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddressModalOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-ribbon-600 hover:text-ribbon-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
                        >
                          <Edit2 size={10} />
                          <span>Change</span>
                        </button>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-burgundy-900 text-sm flex items-center gap-2">
                          <span>{address.name}</span>
                          <span className="text-[10px] font-mono bg-blush-100/80 text-burgundy-900 px-2 py-0.5 rounded-full font-semibold">
                            +91 {address.phone}
                          </span>
                        </div>
                        <p className="text-espresso-600 leading-relaxed text-[11px]">
                          {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} -{" "}
                          <strong className="font-mono text-burgundy-900">{address.postalCode}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-rose-100/60 flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                        <Truck size={12} className="text-emerald-600" />
                        <span>
                          {selectedDeliveryTier === "express" ? "⚡ Express Priority" : "Standard Delivery"}
                        </span>
                      </div>
                      <span className="text-espresso-500">
                        ETA:{" "}
                        <strong className="text-stone-800">
                          {selectedDeliveryTier === "express"
                            ? shippingEstimate?.express?.formattedEDD || shippingEstimate?.formattedEDD || "2-3 Days"
                            : shippingEstimate?.standard?.formattedEDD || shippingEstimate?.formattedEDD || "3-5 Days"}
                        </strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2 flex flex-col items-center justify-center space-y-2 h-full">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 text-ribbon-600 flex items-center justify-center">
                      <MapPin size={18} />
                    </div>
                    <h4 className="font-bold text-xs text-burgundy-900">No address saved</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add new locations</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2: Choose how to pay */}
              <div className="rounded-2xl bg-white border border-rose-100/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between transition-all hover:border-rose-200 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-rose-100/70 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-burgundy-900">
                      <CreditCard size={15} className="text-ribbon-600 shrink-0" />
                      <span>Choose how to pay</span>
                    </div>
                    <span className="text-[10px] text-espresso-400 font-medium">Select option</span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Online Payment */}
                    <label
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        paymentMethod === "razorpay"
                          ? "border-rose-500 bg-rose-50/70 shadow-2xs ring-2 ring-rose-400/25"
                          : "border-stone-200 hover:border-stone-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                          className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-burgundy-900 truncate">
                            Online (UPI, Cards, NetBanking)
                          </div>
                          <div className="text-[10px] text-espresso-400 truncate">
                            Instant secure online payment
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Recommended
                      </span>
                    </label>

                    {/* Cash on Delivery */}
                    {hasCustomKeepsake ? (
                      <div className="p-2.5 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 flex items-center justify-between gap-2 select-none">
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock size={13} className="text-amber-700 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-stone-500 line-through truncate block">
                              Cash on Delivery (COD)
                            </span>
                            <span className="text-[10px] text-amber-800 block truncate">
                              Prepaid required for 3D keepsakes
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          Prepaid Only
                        </span>
                      </div>
                    ) : (
                      <label
                        onClick={() => setPaymentMethod("cod")}
                        className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          paymentMethod === "cod"
                            ? "border-rose-500 bg-rose-50/70 shadow-2xs ring-2 ring-rose-400/25"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-burgundy-900 truncate">
                              Cash on Delivery (COD)
                            </div>
                            <div className="text-[10px] text-espresso-400 truncate">
                              Pay in cash or UPI QR at doorstep
                            </div>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-espresso-400 pt-0.5">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck size={12} />
                    <span>Buyer Protection</span>
                  </span>
                  <span>100% Handcrafted Artisan</span>
                </div>
              </div>
            </div>

            {/* Cart Review Section with Quantity Stepper - Mobile Order: 1st, Desktop: 2nd */}
            <div className="order-1 md:order-2 rounded-2xl bg-white border border-rose-100/90 shadow-2xs p-3.5 sm:p-4.5 space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-100/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-burgundy-900">
                    Cart{" "}
                    <span className="text-xs font-sans font-normal text-espresso-400">
                      ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to remove all items from your bag?")) {
                      clearCart();
                      navigate("/cart");
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 size={12} />
                  <span>Remove all</span>
                </button>
              </div>

              {/* Weekly Studio Production Capacity Badge */}
              {hasCustomKeepsake && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-50/90 via-rose-50/50 to-amber-50/80 border border-amber-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-950 font-medium min-w-0">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    <span>
                      Weekly Studio Capacity:{" "}
                      <strong className="text-burgundy-900 font-bold">
                        {totalKeepsakesInCart} of {WEEKLY_KEEPSAKE_THRESHOLD}
                      </strong>{" "}
                      keepsakes reserved
                    </span>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="divide-y divide-rose-100/60">
                {items.map((item) => {
                  const isKeepsake = isCustomKeepsakeItem(item);
                  const disableIncrement = isKeepsake && isKeepsakeThresholdReached;

                  return (
                    <div key={item.id} className="py-3 sm:py-3.5 flex items-start gap-3 sm:gap-4">
                      {/* Left: Large Thumbnail */}
                      <img
                        src={assetUrl(item.image)}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-rose-100 bg-cream-50 shrink-0 shadow-2xs"
                      />

                      {/* Right: Different rows (Name, Price, and Quantity Control with Total Price) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-1">
                        {/* Row 1: Name */}
                        <div>
                          <h4 className="font-bold text-burgundy-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        {/* Row 2: Price */}
                        <div className="text-xs text-espresso-500 font-medium">
                          {formatPrice(item.price)}{" "}
                          <span className="text-[10px] text-espresso-400">per item</span>
                        </div>

                        {/* Row 3: Quantity control with total price */}
                        <div className="flex items-center justify-between pt-1 mt-auto">
                          {/* Total Price (Bold & Red) */}
                          <div className="font-mono font-extrabold text-sm sm:text-base text-rose-600 tracking-tight">
                            {formatPrice(item.price * item.quantity)}
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-slate-200 rounded-full bg-slate-50/90 p-0.5 shrink-0 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity <= 1) {
                                  removeItem(item.id);
                                } else {
                                  updateQuantity(item.id, item.quantity - 1);
                                }
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-espresso-600 hover:bg-white hover:shadow-2xs transition cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-7 text-center text-xs font-mono font-bold text-burgundy-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={disableIncrement}
                              onClick={() => {
                                if (disableIncrement) {
                                  toast.error(
                                    `Weekly studio threshold reached! Maximum ${WEEKLY_KEEPSAKE_THRESHOLD} custom keepsakes allowed per order.`
                                  );
                                  return;
                                }
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              title={
                                disableIncrement
                                  ? `Weekly studio threshold reached (${WEEKLY_KEEPSAKE_THRESHOLD} max)`
                                  : "Increase quantity"
                              }
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                                disableIncrement
                                  ? "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent"
                                  : "text-espresso-600 hover:bg-white hover:shadow-2xs cursor-pointer"
                              }`}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Sticky Summary) ================= */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="sticky top-16 space-y-3">
              {/* Order Summary & Price Breakdown Card */}
              <div className="rounded-2xl bg-white border border-rose-100/90 shadow-2xs p-4 sm:p-5 space-y-3">
                {/* Promo / Discount code */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
                    Discount Code
                  </label>
                  {appliedCoupon ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                        <Tag size={13} className="text-emerald-600" />
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
                          placeholder="ENTER COUPON CODE"
                          className="input-field text-xs py-2 pl-8 uppercase font-mono"
                        />
                        <Tag size={12} className="absolute left-2.5 top-2.5 text-espresso-300" />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="px-3.5 py-2 bg-burgundy-900 hover:bg-burgundy-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                      >
                        {applyingCoupon ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2.5 border-t border-rose-100/70 space-y-2 text-xs text-espresso-600">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({items.length} {items.length === 1 ? "item" : "items"})
                    </span>
                    <span className="font-mono font-medium text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span className="font-mono">- {formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <span>Shipping</span>
                      {shippingEstimate && (
                        <span className="text-[10px] text-espresso-400 block">
                          {selectedDeliveryTier === "express" ? "⚡ Express Priority" : "Standard Delivery"}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          FREE
                        </span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="pt-2.5 border-t border-rose-100 flex justify-between items-baseline font-display">
                    <span className="text-sm sm:text-base font-bold text-burgundy-900">Amount Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-ribbon-600 font-mono">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Big Checkout CTA Button */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="btn-primary w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider justify-center flex items-center gap-2 shadow-soft cursor-pointer disabled:opacity-50"
                >
                  {placing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>
                      {paymentMethod === "cod"
                        ? `Checkout • COD (${formatPrice(total)})`
                        : `Checkout • ${formatPrice(total)}`}
                    </span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-espresso-400 pt-0.5">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>256-bit Encrypted • 100% Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ADDRESS MODAL ================= */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-burgundy-900 text-white flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-burgundy-900">
                      Delivery Address
                    </h3>
                    <p className="text-[11px] text-espresso-400">
                      Enter destination for your artisan keepsakes
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-espresso-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
                {/* Saved Addresses list */}
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
                        <span>Add New Address</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr, idx) => {
                        const isSelected = selectedSavedIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => selectSavedAddress(addr, idx)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-rose-500 bg-rose-50/70 shadow-2xs ring-2 ring-rose-400/25"
                                : "border-slate-200 hover:border-ribbon-300 bg-white"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-burgundy-900">
                                  {addr.label || "Saved Address"}
                                </span>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-ribbon-600 text-white flex items-center justify-center">
                                    <Check size={12} className="stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-espresso-600 leading-snug">
                                {addr.line1}, {addr.line2 && `${addr.line2}, `}
                                {addr.city}, {addr.state} - {addr.postalCode}
                              </p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-100 text-[10.5px] font-mono text-espresso-400">
                              +91 {addr.phone || user?.phone || address.phone}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form to enter / edit address */}
                {(savedAddresses.length === 0 || isAddingNew) && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                          New Address Details
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(false);
                            if (savedAddresses.length > 0) selectSavedAddress(savedAddresses[0], 0);
                          }}
                          className="text-xs font-semibold text-espresso-500 hover:underline cursor-pointer"
                        >
                          Cancel &amp; Select Saved
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={address.name}
                          onChange={(e) => setAddress({ ...address, name: e.target.value })}
                          placeholder="e.g. Aditi Sharma"
                          className="input-field text-xs py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-espresso-400">
                            +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            value={address.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setAddress({ ...address, phone: val });
                            }}
                            placeholder="10 digit mobile"
                            className="input-field text-xs py-2.5 pl-11 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={address.postalCode}
                          onChange={handlePincodeInput}
                          placeholder="6 digits"
                          className="input-field text-xs py-2.5 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                          City *
                        </label>
                        <input
                          type="text"
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
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          placeholder="e.g. Maharashtra"
                          className="input-field text-xs py-2.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                        Flat / House / Building / Street *
                      </label>
                      <input
                        type="text"
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        placeholder="e.g. Flat 402, Rose Villa, 14th Road"
                        className="input-field text-xs py-2.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-burgundy-900 uppercase mb-1">
                        Area / Locality / Landmark
                      </label>
                      <input
                        type="text"
                        value={address.line2}
                        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                        placeholder="e.g. Near Linking Road"
                        className="input-field text-xs py-2.5"
                      />
                    </div>

                    {isAddingNew && (
                      <label className="flex items-center gap-2 text-xs text-espresso-600 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={savingAddressToProfile}
                          onChange={(e) => setSavingAddressToProfile(e.target.checked)}
                          className="rounded text-burgundy-900 focus:ring-burgundy-900 h-4 w-4"
                        />
                        <span>Save this address to profile for 1-click checkout in future</span>
                      </label>
                    )}
                  </div>
                )}

                {/* Delivery Tier Selection */}
                {/* {shippingEstimate && (
                  <div className="p-4 rounded-2xl bg-cream-50/60 border border-stone-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                        Select Delivery Speed
                      </label>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        PIN {shippingEstimate.deliveryPincode} Serviceable
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div
                        onClick={() => setSelectedDeliveryTier("standard")}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          selectedDeliveryTier === "standard"
                            ? "border-rose-500 bg-white ring-2 ring-rose-400/20 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                          <span>Standard Delivery</span>
                          <span className="font-mono">
                            {isFreeDeliveryQualified ? (
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                FREE
                              </span>
                            ) : (
                              "₹99"
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-rose-700 mt-1 flex items-center gap-1">
                          <Truck size={12} />
                          <span>Arrives by {shippingEstimate.standard?.formattedEDD || shippingEstimate.formattedEDD}</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedDeliveryTier("express")}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative ${
                          selectedDeliveryTier === "express"
                            ? "border-amber-500 bg-white ring-2 ring-amber-400/20 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                          <span>Express Priority ⚡</span>
                          <span className="font-mono">
                            {isFreeDeliveryQualified ? "+₹199" : "₹278"}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>Arrives by {shippingEstimate.express?.formattedEDD || shippingEstimate.formattedEDD}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-rose-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-espresso-600 hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddress}
                  disabled={loadingShiprocket}
                  className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  {loadingShiprocket ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Checking PIN...</span>
                    </>
                  ) : (
                    <span>Deliver to this Address</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
