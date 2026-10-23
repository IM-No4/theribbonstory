import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Truck,
  Check,
  ChevronDown,
  MapPin,
  User,
  Copy,
  CheckCheck,
  Mail,
  Phone,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import OrderItemPersonalization from "../components/OrderItemPersonalization";
import { useSeo } from "../utils/seo";

export default function TrackOrder() {
  useSeo({
    title: "Track Your Order",
    description: "Track your Ribbon Story order status and delivery updates in real time.",
  });

  const [params, setParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(params.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [trackingResponse, setTrackingResponse] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  const trackShipment = useCallback(async (cleanId) => {
    setLoading(true);
    setError("");
    setTrackingResponse(null);

    try {
      const { data } = await api.get(`/shipping/track/${cleanId}`);
      if (data.success) {
        setTrackingResponse(data);
      } else {
        setError(data.message || "Shipment tracking details unavailable");
      }
    } catch (err) {
      setError(err.response?.data?.message || "No active order found with this tracking ID.");
      toast.error("Order not found");
    } finally {
      setLoading(false);
    }
  }, []);

  const urlId = params.get("id");
  useEffect(() => {
    if (urlId) trackShipment(urlId.trim().replace(/^#/, ""));
  }, [urlId, trackShipment]);

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter an Order ID or Tracking Number");
      return;
    }
    const cleanId = identifier.trim().replace(/^#/, "");
    if (cleanId === urlId) trackShipment(cleanId);
    else setParams({ id: cleanId });
  };

  const order = trackingResponse?.order;
  const activities = order?.activities || [];
  const srData = trackingResponse?.shiprocketTracking;
  const srActivities = srData?.shipment_track_activities || [];
  const isCod = order?.paymentMethod === "cod";
  const isPaid = Boolean(order?.isPaid);

  const trackingCode =
    order?.awbCode ||
    order?.trackingNumber ||
    srData?.shipment_track?.[0]?.awb_code ||
    (order ? `TRS-EXP-${order.shortId}` : "");

  const copyTracking = () => {
    if (!trackingCode) return;
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    toast.success("Tracking code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // 5 Clean Structured Lifecycle Steps (matching the layout in mockup)
  const steps = [
    {
      step: 1,
      title: "Order Confirmed",
      desc: isCod ? "Cash on Delivery" : "Payment Verified",
    },
    {
      step: 2,
      title: "In Studio",
      desc: "3D Artisans Crafting",
    },
    {
      step: 3,
      title: "Ready to Ship",
      desc: "Quality Checked & Boxed",
    },
    {
      step: 4,
      title: "In Transit",
      desc: "Dispatched via Express Courier",
    },
    {
      step: 5,
      title: "Delivered",
      desc: "Safely at Doorstep",
    },
  ];

  const currentStep = order?.currentStep || 1;
  const progressPercent = Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100));

  // Formatted Creation Date
  const createdDateStr = order?.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // Estimated delivery display
  const estDeliveryStr = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "3–5 Business Days";

  const itemsPrice = order?.itemsPrice ?? order?.totalPrice ?? 0;
  const shippingPrice = order?.shippingPrice ?? 0;
  const discountPrice = order?.discountPrice ?? 0;
  const totalPrice = order?.totalPrice ?? 0;

  return (
    <div className="bg-slate-100/70 min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tracking Search Input Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs mb-6">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter 6-digit Order ID (e.g. 1B0E7C) or Tracking Number"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center text-rose-800 space-y-1 mb-6">
            <AlertCircle size={22} className="mx-auto text-rose-600" />
            <div className="font-bold text-sm">{error}</div>
            <p className="text-xs text-rose-600">
              Please double check the Order ID format or contact our studio support team.
            </p>
          </div>
        )}

        {/* Main Structured Tracking View (3 Distinct Cards as specified) */}
        {trackingResponse && order && (
          <div className="space-y-6">
            {/* CARD 1: ORDER DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                  Order Details - #{order.shortId || identifier.toUpperCase()}
                </h2>
                {createdDateStr && (
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">
                    Created: <span className="text-slate-800 font-semibold">{createdDateStr}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <User size={15} className="text-slate-400 shrink-0" />
                  <span>
                    Customer: <strong className="text-slate-900">{order.shippingAddress?.name || "Customer"}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">{order.deliverySlot || "Standard Delivery (3-5 Days)"}</span>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`font-semibold ${
                      isCod ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md" : "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"
                    }`}
                  >
                    {isCod ? "Cash on Delivery" : "Prepaid (Online)"}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Delivery address:{" "}
                    <span className="text-slate-800 font-medium">
                      {order.shippingAddress?.line1 ? `${order.shippingAddress.line1}, ` : ""}
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: SHIPMENT */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
              {/* Shipment Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                  Shipment
                </h2>
                {trackingCode && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <span>Tracking:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {trackingCode}
                    </span>
                    <button
                      onClick={copyTracking}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                      title="Copy tracking code"
                      type="button"
                    >
                      {copied ? <CheckCheck size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Courier & Estimated Delivery Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold">
                    <Truck size={17} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {order.courierPartner || "Express Delivery"}
                    </div>
                    <div className="text-[11px] text-slate-400">Doorstep Courier Delivery</div>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-500">
                  Estimated delivery:{" "}
                  <strong className="text-slate-900 font-semibold">{estDeliveryStr}</strong>
                </div>
              </div>

              {/* Horizontal Stepper */}
              <div className="pt-2 pb-2">
                <div className="relative">
                  {/* Connecting Track Line */}
                  <div className="hidden sm:block absolute top-3.5 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* 5 Step Icons */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
                    {steps.map((s) => {
                      const isCompleted = currentStep > s.step;
                      const isCurrent = currentStep === s.step;

                      return (
                        <div
                          key={s.step}
                          className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition ${
                              isCompleted
                                ? "bg-sky-500 text-white shadow-xs"
                                : isCurrent
                                ? "bg-white border-2 border-sky-500 ring-4 ring-sky-100"
                                : "bg-white border-2 border-slate-300 text-transparent"
                            }`}
                          >
                            {isCompleted ? (
                              <Check size={14} strokeWidth={3} />
                            ) : isCurrent ? (
                              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-transparent" />
                            )}
                          </div>
                          <div>
                            <div
                              className={`text-xs font-semibold ${
                                isCurrent ? "text-sky-700 font-bold" : isCompleted ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {s.title}
                            </div>
                            <div className="text-[10px] text-slate-500 sm:mt-0.5">{s.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tracking Details Toggle Dropdown */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer transition select-none"
                >
                  <span>Tracking Details</span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
                  />
                </button>

                {showDetails && (
                  <div className="mt-4 pl-3 border-l-2 border-slate-200 space-y-4 text-xs">
                    {/* Real Order Activities */}
                    {activities.map((act, idx) => (
                      <div key={idx} className="relative pl-3">
                        <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white" />
                        <div className="font-bold text-slate-900">{act.activity}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {act.date} • {act.location}
                        </div>
                      </div>
                    ))}

                    {/* Live Courier Activities if dispatched */}
                    {srActivities.map((act, idx) => (
                      <div key={`sr-${idx}`} className="relative pl-3">
                        <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                        <div className="font-bold text-slate-900">{act.activity}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {act.date} • {act.location}
                        </div>
                      </div>
                    ))}

                    {activities.length === 0 && srActivities.length === 0 && (
                      <div className="text-slate-500 italic">No tracking updates recorded yet.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Items Section inside Shipment Card */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between pb-3 text-xs font-semibold text-slate-400">
                  <span className="text-slate-900 font-bold text-xs sm:text-sm">
                    Total items: {order.items?.length || 0}
                  </span>
                  <div className="flex items-center gap-8 sm:gap-14">
                    <span className="w-16 text-center">Quantity</span>
                    <span className="w-16 text-right">Total</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={assetUrl(item.image || "/images/photo-magnet.webp")}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {item.color && (
                              <span>
                                Color: <strong>{item.color}</strong>
                              </span>
                            )}
                            {item.size && (
                              <span>
                                Size: <strong>{item.size}</strong>
                              </span>
                            )}
                            {!item.color && !item.size && <span>Bespoke 3D Keepsake</span>}
                          </div>
                          <OrderItemPersonalization item={item} />
                        </div>
                      </div>

                      <div className="flex items-center gap-8 sm:gap-14 shrink-0 text-xs sm:text-sm">
                        <span className="w-16 text-center text-slate-600 font-medium">{item.quantity}</span>
                        <span className="w-16 text-right font-bold text-slate-900">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD 3: SUMMARY */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-3.5">
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-900">Summary</h3>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Items</span>
                  <span className="font-medium text-slate-900">₹{itemsPrice.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Delivery cost</span>
                  <span className="font-medium text-slate-900">
                    {shippingPrice === 0 ? "FREE" : `₹${shippingPrice.toLocaleString("en-IN")}`}
                  </span>
                </div>

                {discountPrice > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discountPrice.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Taxes</span>
                  <span className="font-medium text-slate-900">Included</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900">
                  <span>Total</span>
                  <div className="flex items-center gap-2">
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                    {isCod && !isPaid ? (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Pay on Delivery
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Support Footer */}
            <div className="pt-4 pb-8 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              <span>For more information, contact customer support:</span>
              <a
                href="mailto:support@theribbonstory.com"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition"
              >
                <Mail size={14} className="text-slate-400" /> support@theribbonstory.com
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium transition"
              >
                <Phone size={14} className="text-slate-400" /> +91 98765 43210
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
