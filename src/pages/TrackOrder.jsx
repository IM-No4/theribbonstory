
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
  XCircle,
  Package,
  Clock,
  CreditCard,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import OrderItemPersonalization from "../components/OrderItemPersonalization";
import { useSeo } from "../utils/seo";

const STEPS = [
  { step: 1, title: "Order confirmed", desc: "Order received" },
  { step: 2, title: "In studio", desc: "Being prepared" },
  { step: 3, title: "Ready to ship", desc: "Quality checked" },
  { step: 4, title: "In transit", desc: "On its way" },
  { step: 5, title: "Delivered", desc: "At your doorstep" },
];

const formatDate = (date, includeTime = false) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
  });
};

const formatPrice = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function TrackOrder() {
  useSeo({
    title: "Track Your Order | The Ribbon Story",
    description:
      "Check your Ribbon Story order status, shipment updates, delivery estimate and order details.",
  });

  const [params, setParams] = useSearchParams();
  const urlId = params.get("id");

  const [identifier, setIdentifier] = useState(urlId || "");
  const [loading, setLoading] = useState(false);
  const [trackingResponse, setTrackingResponse] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const trackShipment = useCallback(async (cleanId) => {
    if (!cleanId) return;

    setLoading(true);
    setError("");
    setTrackingResponse(null);

    try {
      const { data } = await api.get(
        `/shipping/track/${encodeURIComponent(cleanId)}`
      );

      if (data.success) {
        setTrackingResponse(data);
        setShowDetails(false);
      } else {
        setError(data.message || "Shipment tracking details are unavailable.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't find an order with that ID. Please check it and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlId) {
      const cleanId = urlId.trim().replace(/^#/, "");
      setIdentifier(cleanId);
      trackShipment(cleanId);
    }
  }, [urlId, trackShipment]);

  const handleTrack = (event) => {
    event.preventDefault();

    const cleanId = identifier.trim().replace(/^#/, "");

    if (!cleanId) {
      toast.error("Please enter your Order ID or tracking number.");
      return;
    }

    if (cleanId === urlId) {
      trackShipment(cleanId);
    } else {
      setParams({ id: cleanId });
    }
  };

  const order = trackingResponse?.order;
  const activities = order?.activities || [];
  const srData = trackingResponse?.shiprocketTracking;
  const srActivities = srData?.shipment_track_activities || [];

  const isCod = order?.paymentMethod === "cod";
  const isPaid = Boolean(order?.isPaid);
  const isCancelled = order?.status === "cancelled";

  const trackingCode =
    order?.awbCode ||
    order?.trackingNumber ||
    srData?.shipment_track?.[0]?.awb_code ||
    (order ? `TRS-EXP-${order.shortId}` : "");

  const currentStep = isCancelled
    ? 0
    : Math.min(5, Math.max(1, Number(order?.currentStep) || 1));

  const progressPercent = isCancelled
    ? 0
    : ((currentStep - 1) / 4) * 100;

  const createdDate = formatDate(order?.createdAt, true);

  const estimatedDelivery =
    !isCancelled && order?.estimatedDelivery
      ? formatDate(order.estimatedDelivery)
      : !isCancelled
        ? "To be confirmed"
        : null;

  const itemsPrice = Number(order?.itemsPrice ?? order?.totalPrice ?? 0);
  const shippingPrice = Number(order?.shippingPrice ?? 0);
  const discountPrice = Number(order?.discountPrice ?? 0);
  const totalPrice = Number(order?.totalPrice ?? 0);

  const copyTracking = async () => {
    if (!trackingCode) return;

    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      toast.success("Tracking code copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy tracking code.");
    }
  };

  const clearSearch = () => {
    setIdentifier("");
    setTrackingResponse(null);
    setError("");
    setParams({});
  };

  return (
    <main className="min-h-screen bg-[#FBF8F4] text-stone-800">
      {/* PAGE INTRO */}
      <section className="border-b border-stone-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 sm:h-12 sm:w-12">
              <Package size={22} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 sm:text-xs">
                The Ribbon Story
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                Track your order
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-stone-600 sm:text-sm sm:leading-6">
                Every little keepsake has a journey. Enter your order ID or
                tracking number to see the latest available updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8">
        {/* SEARCH */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_3px_16px_rgba(60,40,30,0.025)] sm:rounded-3xl sm:p-6">
          <form
            onSubmit={handleTrack}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Order ID or tracking number"
                aria-label="Order ID or tracking number"
                autoComplete="off"
                className="min-h-12 w-full rounded-xl border border-stone-200 bg-[#FBF8F4] py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-36"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Searching
                </>
              ) : (
                <>
                  Track order
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {!trackingResponse && !error && !loading && (
            <p className="mt-3 flex items-center gap-2 text-[11px] leading-5 text-stone-500 sm:text-xs">
              <Sparkles size={13} className="shrink-0 text-rose-500" />
              Your order updates will appear here once your order is found.
            </p>
          )}
        </section>

        {/* ERROR */}
        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-white p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <AlertCircle size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-stone-900">
                  We couldn't find your order
                </h2>
                <p className="mt-1 text-xs leading-5 text-stone-600">
                  {error}
                </p>
                <p className="mt-2 text-xs leading-5 text-stone-500">
                  Check your order ID and try again. If you still need help,
                  contact our support team.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TRACKING RESULTS */}
        {trackingResponse && order && (
          <>
            {/* ORDER HEADER */}
            <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_3px_16px_rgba(60,40,30,0.025)] sm:rounded-3xl">
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 sm:text-xs">
                      Order details
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold text-stone-900 sm:text-2xl">
                      #{order.shortId || identifier.toUpperCase()}
                    </h2>
                    {createdDate && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-stone-500 sm:text-xs">
                        <CalendarDays size={13} />
                        Placed {createdDate}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold sm:text-xs ${
                      isCancelled
                        ? "border-rose-200 bg-rose-50 text-rose-800"
                        : currentStep === 5
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {isCancelled ? (
                      <XCircle size={13} />
                    ) : currentStep === 5 ? (
                      <Check size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                    {isCancelled
                      ? "Cancelled"
                      : currentStep === 5
                        ? "Delivered"
                        : "In progress"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <User
                      size={16}
                      className="mt-0.5 shrink-0 text-stone-400"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-500 sm:text-xs">
                        Customer
                      </p>
                      <p className="mt-0.5 break-words text-xs font-semibold text-stone-900 sm:text-sm">
                        {order.shippingAddress?.name || "Customer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-2.5">
                    <CreditCard
                      size={16}
                      className="mt-0.5 shrink-0 text-stone-400"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-500 sm:text-xs">
                        Payment method
                      </p>
                      <p
                        className={`mt-0.5 text-xs font-semibold sm:text-sm ${
                          isCod ? "text-amber-700" : "text-emerald-700"
                        }`}
                      >
                        {isCod ? "Cash on Delivery" : "Prepaid online"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-2.5 sm:col-span-2">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-stone-400"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-500 sm:text-xs">
                        Delivery address
                      </p>
                      <p className="mt-0.5 break-words text-xs leading-5 text-stone-800 sm:text-sm">
                        {[
                          order.shippingAddress?.line1,
                          order.shippingAddress?.city,
                          order.shippingAddress?.state,
                          order.shippingAddress?.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Address unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SHIPMENT STATUS */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_3px_16px_rgba(60,40,30,0.025)] sm:rounded-3xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 sm:text-xs">
                    Delivery journey
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-stone-900 sm:text-2xl">
                    {isCancelled
                      ? "Order cancelled"
                      : currentStep === 5
                        ? "Your keepsake has arrived"
                        : currentStep === 4
                          ? "Your order is on its way"
                          : currentStep === 3
                            ? "Getting ready to ship"
                            : currentStep === 2
                              ? "Being prepared"
                              : "Your order is confirmed"}
                  </h2>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    isCancelled
                      ? "bg-rose-50 text-rose-700"
                      : "bg-[#F9EDE7] text-rose-700"
                  }`}
                >
                  {isCancelled ? (
                    <XCircle size={22} />
                  ) : currentStep === 5 ? (
                    <Check size={22} />
                  ) : (
                    <Truck size={22} />
                  )}
                </div>
              </div>

              {isCancelled ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-sm font-bold text-rose-900">
                    This order is no longer being processed.
                  </p>
                  {order.cancelledAt && (
                    <p className="mt-1 text-[11px] text-rose-700">
                      Cancelled {formatDate(order.cancelledAt, true)}
                    </p>
                  )}
                  {order.cancellationReason && (
                    <p className="mt-2 text-xs leading-5 text-rose-800">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                  {!isCod && isPaid && (
                    <p className="mt-2 text-xs leading-5 text-rose-800">
                      If your payment was collected, contact support for
                      information about the refund status.
                    </p>
                  )}
                  {isCod && (
                    <p className="mt-2 text-xs text-rose-800">
                      No Cash on Delivery payment was collected.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* DESKTOP PROGRESS */}
                  <div className="mt-7 hidden sm:block">
                    <div className="relative px-3">
                      <div className="absolute left-[9%] right-[9%] top-4 h-1 rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="relative grid grid-cols-5 gap-2">
                        {STEPS.map((step) => {
                          const completed = currentStep > step.step;
                          const current = currentStep === step.step;

                          return (
                            <div
                              key={step.step}
                              className="flex flex-col items-center text-center"
                            >
                              <div
                                className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                                  completed
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : current
                                      ? "border-rose-500 bg-white text-rose-600 ring-4 ring-rose-50"
                                      : "border-stone-200 bg-white text-stone-400"
                                }`}
                              >
                                {completed ? (
                                  <Check size={15} strokeWidth={3} />
                                ) : (
                                  <span className="text-[10px] font-bold">
                                    {step.step}
                                  </span>
                                )}
                              </div>
                              <p
                                className={`mt-3 text-xs font-bold ${
                                  current || completed
                                    ? "text-stone-900"
                                    : "text-stone-400"
                                }`}
                              >
                                {step.title}
                              </p>
                              <p className="mt-1 text-[10px] text-stone-500">
                                {step.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* MOBILE PROGRESS */}
                  <div className="mt-5 space-y-4 sm:hidden">
                    {STEPS.map((step) => {
                      const completed = currentStep > step.step;
                      const current = currentStep === step.step;

                      return (
                        <div
                          key={step.step}
                          className="flex items-start gap-3"
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                              completed
                                ? "border-rose-600 bg-rose-600 text-white"
                                : current
                                  ? "border-rose-500 bg-white text-rose-600 ring-4 ring-rose-50"
                                  : "border-stone-200 bg-white text-stone-400"
                            }`}
                          >
                            {completed ? (
                              <Check size={13} strokeWidth={3} />
                            ) : (
                              <span className="text-[10px] font-bold">
                                {step.step}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            <p
                              className={`text-xs font-bold ${
                                current || completed
                                  ? "text-stone-900"
                                  : "text-stone-400"
                              }`}
                            >
                              {step.title}
                              {current && (
                                <span className="ml-2 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                                  CURRENT
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] text-stone-500">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* COURIER AND ESTIMATE */}
              <div className="mt-5 grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-[#FBF8F4] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-stone-600">
                    {isCancelled ? (
                      <XCircle size={17} />
                    ) : (
                      <Truck size={17} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-500">Courier</p>
                    <p className="mt-0.5 truncate text-xs font-bold text-stone-900">
                      {isCancelled
                        ? "Shipment cancelled"
                        : order.courierPartner || "Courier details pending"}
                    </p>
                  </div>
                </div>

                {!isCancelled && (
                  <div className="flex items-center gap-3 rounded-xl bg-[#FBF8F4] p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-stone-600">
                      <CalendarDays size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-500">
                        Estimated delivery
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-stone-900">
                        {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* TRACKING NUMBER */}
              {trackingCode && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 px-3.5 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Truck size={15} className="shrink-0 text-stone-400" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-500">
                        Tracking number
                      </p>
                      <p className="break-all font-mono text-xs font-bold text-stone-900">
                        {trackingCode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyTracking}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-[11px] font-bold text-stone-700 transition hover:border-rose-300"
                  >
                    {copied ? (
                      <CheckCheck size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              )}

              {/* ACTIVITY HISTORY */}
              <div className="border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDetails((previous) => !previous)}
                  aria-expanded={showDetails}
                  className="flex min-h-10 w-full items-center justify-between gap-3 text-left"
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-stone-800 sm:text-sm">
                    <Clock size={15} className="text-rose-600" />
                    Shipment activity
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                      {activities.length + srActivities.length}
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-stone-500 transition-transform ${
                      showDetails ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDetails && (
                  <div className="mt-4 border-l-2 border-rose-100 pl-4">
                    {[...activities, ...srActivities].length > 0 ? (
                      [...activities, ...srActivities].map((activity, index) => {
                        const cancelled =
                          String(activity.status || "").toUpperCase() ===
                          "CANCELLED";

                        return (
                          <div
                            key={`${activity.activity}-${activity.date}-${index}`}
                            className="relative pb-5 last:pb-1"
                          >
                            <div
                              className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white ring-1 ${
                                cancelled
                                  ? "bg-rose-500 ring-rose-200"
                                  : "bg-rose-400 ring-rose-100"
                              }`}
                            />
                            <p
                              className={`text-xs font-bold ${
                                cancelled
                                  ? "text-rose-800"
                                  : "text-stone-900"
                              }`}
                            >
                              {activity.activity || activity.status || "Update"}
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-stone-500">
                              {[activity.date, activity.location]
                                .filter(Boolean)
                                .join(" · ") || "Timestamp unavailable"}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="py-2 text-xs leading-5 text-stone-500">
                        No shipment updates have been recorded yet. Check
                        again later for new information.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ORDER ITEMS */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_3px_16px_rgba(60,40,30,0.025)] sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 sm:text-xs">
                    Your order
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-stone-900">
                    Order items
                  </h2>
                </div>
                <span className="rounded-full bg-[#FBF8F4] px-3 py-1.5 text-[10px] font-bold text-stone-600 sm:text-xs">
                  {order.items?.length || 0}{" "}
                  {(order.items?.length || 0) === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="mt-4 divide-y divide-stone-100 border-t border-stone-100">
                {order.items?.map((item, index) => (
                  <div
                    key={item._id || item.product || index}
                    className="flex items-start gap-3 py-4"
                  >
                    <img
                      src={assetUrl(
                        item.image || "/images/photo-magnet.webp"
                      )}
                      alt={item.name || "Order item"}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-xl border border-stone-200 bg-[#FBF8F4] object-cover sm:h-20 sm:w-20"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-xs font-bold leading-5 text-stone-900 sm:text-sm">
                        {item.name}
                      </h3>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-stone-500 sm:text-xs">
                        {item.color && (
                          <span>
                            Colour:{" "}
                            <strong className="font-semibold text-stone-700">
                              {item.color}
                            </strong>
                          </span>
                        )}
                        {item.size && (
                          <span>
                            Size:{" "}
                            <strong className="font-semibold text-stone-700">
                              {item.size}
                            </strong>
                          </span>
                        )}
                        <span>Qty: {item.quantity || 1}</span>
                      </div>

                      <div className="mt-2">
                        <OrderItemPersonalization item={item} />
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-stone-900 sm:text-sm">
                        {formatPrice(
                          Number(item.price || 0) * Number(item.quantity || 1)
                        )}
                      </p>
                      <p className="mt-1 text-[10px] text-stone-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRICE SUMMARY */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_3px_16px_rgba(60,40,30,0.025)] sm:rounded-3xl sm:p-6">
              <div className="flex items-center gap-2">
                <ShoppingBag size={17} className="text-rose-700" />
                <h2 className="font-display text-lg font-bold text-stone-900">
                  Payment summary
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-600">Items subtotal</span>
                  <span className="font-medium text-stone-900">
                    {formatPrice(itemsPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-600">Delivery</span>
                  <span
                    className={`font-medium ${
                      shippingPrice === 0
                        ? "text-emerald-700"
                        : "text-stone-900"
                    }`}
                  >
                    {shippingPrice === 0 ? "FREE" : formatPrice(shippingPrice)}
                  </span>
                </div>

                {discountPrice > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-stone-600">Discount</span>
                    <span className="font-medium text-emerald-700">
                      −{formatPrice(discountPrice)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-stone-600">Taxes</span>
                  <span className="font-medium text-stone-700">Included</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                  <div>
                    <p className="font-display text-base font-bold text-stone-900 sm:text-lg">
                      Total
                    </p>
                    <p className="mt-0.5 text-[10px] text-stone-500">
                      {isCod && !isPaid
                        ? "Payment due on delivery"
                        : "Payment status"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-stone-900 sm:text-2xl">
                      {formatPrice(totalPrice)}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        isCod && !isPaid
                          ? "bg-amber-50 text-amber-800"
                          : isPaid
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {isCod && !isPaid
                        ? "Pay on delivery"
                        : isPaid
                          ? "Paid"
                          : "Payment pending"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SUPPORT */}
            <section className="rounded-2xl border border-stone-200/80 bg-white p-4 sm:rounded-3xl sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <Mail size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-stone-900">
                    Need a hand with your order?
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-stone-500">
                    Contact our support team if you have a question about your
                    delivery or order details.
                  </p>

                  <div className="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                    <a
                      href="mailto:support@theribbonstory.com"
                      className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-rose-700 hover:text-rose-900"
                    >
                      <Mail size={14} />
                      support@theribbonstory.com
                    </a>

                    <a
                      href="tel:+917905275048"
                      className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-rose-700 hover:text-rose-900"
                    >
                      <Phone size={14} />
                      +91 79052 75048
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* EMPTY STATE */}
        {!trackingResponse && !error && !loading && (
          <section className="px-4 py-8 text-center sm:py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-stone-200 bg-white text-rose-600 shadow-sm">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-stone-900 sm:text-2xl">
              Where is your keepsake?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-stone-500 sm:text-sm">
              Enter the Order ID from your order confirmation to see its
              current status and available delivery updates.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
