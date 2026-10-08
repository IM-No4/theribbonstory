import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Gift,
  AlertCircle,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import OrderItemPersonalization from "../components/OrderItemPersonalization";
import { useSeo } from "../utils/seo";

export default function TrackOrder() {
  useSeo({ title: "Track Your Order", description: "Track your Ribbon Story order with your order ID or AWB tracking number." });
  const [params, setParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(params.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [trackingResponse, setTrackingResponse] = useState(null);
  const [error, setError] = useState("");

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

  // The ?id= URL parameter is the source of truth: links, reloads and
  // back/forward navigation all track the order it names
  const urlId = params.get("id");
  useEffect(() => {
    if (urlId) trackShipment(urlId.trim().replace(/^#/, ""));
  }, [urlId, trackShipment]);

  const handleTrack = (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Please enter an Order ID or AWB Tracking Number");
      return;
    }
    const cleanId = identifier.trim().replace(/^#/, "");
    // Same id as the URL: the effect won't re-run, so fetch directly
    if (cleanId === urlId) trackShipment(cleanId);
    else setParams({ id: cleanId });
  };

  const order = trackingResponse?.order;
  const srData = trackingResponse?.shiprocketTracking;
  const srActivities = srData?.shipment_track_activities || [];
  const srTrack = srData?.shipment_track?.[0];

  const timelineSteps = [
    {
      step: 1,
      title: "Order Confirmed",
      desc: "Payment verified & order booked",
      icon: CheckCircle2,
    },
    {
      step: 2,
      title: "Handcrafted in Studio",
      desc: "Artisans 3D printing & hand-painting",
      icon: Sparkles,
    },
    {
      step: 3,
      title: "Quality Check & Ribbon Box",
      desc: "Sealed in protective velvet packaging",
      icon: Gift,
    },
    {
      step: 4,
      title: "Dispatched via Express Courier",
      desc: "Handed over to courier partner",
      icon: Truck,
    },
    {
      step: 5,
      title: "Delivered",
      desc: "Safely received at your doorstep",
      icon: MapPin,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-ribbon-600 text-xs font-bold uppercase tracking-wider">
            <Truck size={14} className="text-ribbon-500" />
            <span>Live Shipment Tracking</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            Track Your Keepsake Order
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Enter your 6-digit Order ID or AWB Tracking Number to follow your bespoke package in real time.
          </p>
        </div>

        {/* Tracking Input Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. TRS-EXP-123456, SR123456789IN or 6-digit Order ID"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-ribbon-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-3.5 px-8 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Track Package</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper */}
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 gap-2">
            <span>💡 Real-time Courier Status (BlueDart, Delhivery, DTDC, Express Air).</span>
            <Link to="/contact" className="text-ribbon-600 font-semibold hover:underline">
              Need WhatsApp Support?
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 space-y-2 mb-8">
            <AlertCircle size={24} className="mx-auto text-rose-600" />
            <div className="font-bold text-base">{error}</div>
            <p className="text-xs text-rose-600 max-w-md mx-auto">
              Please double check the ID format or log into your account to view your past orders.
            </p>
          </div>
        )}

        {/* Tracking Results Card */}
        {trackingResponse && (
          <div className="space-y-6">
            {/* 1. Main Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
              {/* Top Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-2xl font-extrabold text-slate-900">
                      Order #{order?.shortId || identifier.toUpperCase()}
                    </span>
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {order?.status || srData?.shipment_status || "In Transit"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {order?.createdAt
                      ? `Placed on ${new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`
                      : "Active Consignment"}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Carrier Partner
                  </div>
                  <div className="font-display text-base font-extrabold text-slate-900 flex items-center sm:justify-end gap-1.5 mt-0.5">
                    <Award size={16} className="text-ribbon-500" />
                    <span>{order?.courierPartner || srTrack?.courier_name || "Express Air Courier"}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    AWB: <strong>{order?.trackingNumber || srTrack?.awb_code || "AWB-IN"}</strong>
                  </div>
                </div>
              </div>

              {/* Refund Notice Banner if Refunded / Requested */}
              {order?.isRefunded && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-emerald-900 text-sm">
                      Refund Processed (₹{order.refundAmount || order.totalPrice})
                    </div>
                    <p className="text-emerald-700">
                      Payment refund successfully initiated back to customer&apos;s source account. Reference ID:{" "}
                      <span className="font-mono font-bold">{order.refundId || "rfnd_processed"}</span>
                    </p>
                    {order.refundReason && (
                      <p className="text-emerald-600 italic">&quot;{order.refundReason}&quot;</p>
                    )}
                  </div>
                </div>
              )}

              {order?.refundStatus === "requested" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-amber-900 text-sm">
                      Cancellation & Refund Requested
                    </div>
                    <p className="text-amber-700">
                      Our artisan team has received this cancellation request and is processing the reversal.
                    </p>
                  </div>
                </div>
              )}

              {/* 5-Step Visual Timeline */}
              <div className="py-2">
                <div className="relative">
                  {/* Connecting Line */}
                  <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full z-0">
                    <div
                      className="h-full bg-gradient-to-r from-ribbon-500 via-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, (((order?.currentStep || 3) - 1) / 4) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                    {timelineSteps.map((step) => {
                      const StepIcon = step.icon;
                      const isCompleted = (order?.currentStep || 3) >= step.step;
                      const isCurrent = (order?.currentStep || 3) === step.step;

                      return (
                        <div
                          key={step.step}
                          className={`flex md:flex-col items-center md:text-center gap-3.5 p-3 rounded-2xl transition ${
                            isCurrent
                              ? "bg-rose-50/70 border border-rose-200"
                              : isCompleted
                              ? "opacity-100"
                              : "opacity-40"
                          }`}
                        >
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold transition shadow-sm ${
                              isCompleted
                                ? "bg-emerald-600 shadow-emerald-200"
                                : isCurrent
                                ? "bg-ribbon-600 animate-pulse shadow-rose-200"
                                : "bg-slate-300 text-slate-600"
                            }`}
                          >
                            <StepIcon size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">{step.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Destination Address & Summary */}
              {order?.shippingAddress && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-ribbon-600 shrink-0" />
                    <span>
                      Delivering to:{" "}
                      <strong>
                        {order.shippingAddress.name} — {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} ({order.shippingAddress.postalCode})
                      </strong>
                    </span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 font-display">
                    Paid: ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Shiprocket Live Courier Activity Scans */}
            {srActivities.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-ribbon-500" />
                    <span>Live Courier Activity Checkpoints</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Live Carrier Sync
                  </span>
                </div>

                <div className="space-y-4">
                  {srActivities.map((act, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-3.5 relative">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0 mt-1" />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-slate-900">{act.activity}</div>
                        <div className="text-slate-500 flex items-center gap-2 mt-0.5 text-[11px]">
                          <span>{act.location}</span>
                          <span>•</span>
                          <span>{act.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Package Items */}
            {order?.items?.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-4">
                <h4 className="font-display font-bold text-base text-slate-900">
                  Package Contents ({order.items.length} items)
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={assetUrl(item.image || "/images/photo-magnet.webp")}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Qty: {item.quantity} × ₹{item.price}
                          </div>
                          <OrderItemPersonalization item={item} />
                        </div>
                      </div>
                      <div className="font-bold text-xs text-slate-900">
                        ₹{(item.price || 0) * (item.quantity || 1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
