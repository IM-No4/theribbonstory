import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Printer,
  Truck,
  Copy,
  Check,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => {
        toast.error("Could not load order details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success("Order ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-ribbon-500" size={36} />
        <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-900">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-burgundy-900">Order Not Found</h2>
        <p className="text-sm text-espresso-400">
          We couldn't locate the order details. Please check your order history.
        </p>
        <Link to="/orders" className="btn-primary inline-block">
          View My Orders
        </Link>
      </div>
    );
  }

  const shortId = order._id.slice(-8).toUpperCase();

  return (
    <div className="bg-cream-50 min-h-screen py-10 sm:py-16">
      <div className="container-page max-w-3xl">
        {/* Header Ribbon Confetti Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-burgundy-900 to-ribbon-500 text-cream-50 shadow-xl shadow-rose-200/50">
            <CheckCircle2 size={40} className="stroke-[2.5]" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-burgundy-900">
            Thank You! Your Story is Being Crafted
          </h1>
          <p className="text-xs sm:text-sm text-espresso-500 max-w-lg mx-auto leading-relaxed">
            Order confirmed &amp; queued in our studio. Our master artisans are preparing your bespoke keepsakes with love and precision.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blush-200 shadow-xs text-xs">
            <span className="text-espresso-400">Order Reference:</span>
            <span className="font-mono font-bold text-burgundy-900">#{shortId}</span>
            <button
              onClick={copyOrderId}
              className="text-ribbon-500 hover:text-burgundy-900 transition p-1"
              title="Copy Order ID"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
        </motion.div>

        {/* Quick Action Buttons (Print & Track) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 print:hidden">
          <Link
            to={`/track-order?orderId=${order._id}`}
            className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
          >
            <Truck size={16} />
            <span>Track Order Timeline</span>
          </Link>

          <button
            onClick={handlePrint}
            className="btn-outline py-2.5 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white"
          >
            <Printer size={16} />
            <span>Print Invoice / Receipt</span>
          </button>
        </div>

        {/* Itemized Order & Keepsake Receipt Card */}
        <div className="bg-white rounded-3xl border border-blush-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Receipt Top Header */}
          <div className="bg-gradient-to-r from-burgundy-900 via-ribbon-600 to-burgundy-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl tracking-tight">The Ribbon Story</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20">
                  Keepsake Studio
                </span>
              </div>
              <p className="text-xs text-rose-100/80 mt-1">
                Bespoke 3D Sculptures, Keepsakes &amp; Personalized Hampers
              </p>
            </div>
            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="text-rose-200 text-[11px]">Placed on</div>
              <div className="font-bold">
                {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Status & Delivery Estimate Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50 border border-blush-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blush-100 text-burgundy-900">
                  <Package size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-burgundy-900">
                    Status: <span className="text-ribbon-600 capitalize">{order.status || "Confirmed"}</span>
                  </div>
                  <div className="text-[11px] text-espresso-400">
                    {order.scheduledDeliveryDate
                      ? `Scheduled Delivery: ${new Date(order.scheduledDeliveryDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })} (${order.deliverySlot || "Standard Daytime"})`
                      : "Estimated Delivery: 3 to 5 business days"}
                  </div>
                </div>
              </div>
              <Link
                to={`/track-order?orderId=${order._id}`}
                className="text-xs font-bold text-ribbon-600 hover:text-burgundy-900 flex items-center gap-1"
              >
                <span>View Timeline</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Gift Wrapping Details (if selected) */}
            {order.giftOptions?.isGift && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-blush-50/70 border border-rose-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900">
                    <Gift size={16} className="text-ribbon-500" />
                    <span>Luxury Gift Packaging Included</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    {order.giftOptions.ribbonColor || "Classic Ribbon"}
                  </span>
                </div>
                {order.giftOptions.cardTheme && (
                  <p className="text-xs text-espresso-600">
                    <span className="font-semibold">Card Theme:</span> {order.giftOptions.cardTheme}
                  </p>
                )}
                {order.giftOptions.giftMessage && (
                  <div className="bg-white/90 p-3 rounded-xl border border-rose-100 text-xs italic text-burgundy-900">
                    "{order.giftOptions.giftMessage}"
                  </div>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 border-b border-blush-100 pb-2">
                Order Items ({order.items.length})
              </h3>
              <div className="divide-y divide-blush-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-start gap-4">
                    <img
                      src={assetUrl(item.image)}
                      alt={item.name}
                      className="h-16 w-16 rounded-xl object-cover bg-rose-50 border border-blush-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-burgundy-900 line-clamp-1">
                        {item.name}
                      </h4>
                      {item.customization?.text && (
                        <p className="text-xs text-ribbon-600 mt-0.5">
                          Engraved Text: <span className="italic font-semibold">"{item.customization.text}"</span>
                        </p>
                      )}
                      {item.customization?.shape && (
                        <p className="text-[11px] text-espresso-400 capitalize">
                          Shape: {item.customization.shape}
                        </p>
                      )}
                      {item.selectedOptions && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {Object.entries(
                            item.selectedOptions instanceof Map
                              ? Object.fromEntries(item.selectedOptions)
                              : item.selectedOptions
                          ).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-cream-100 text-espresso-600 px-2 py-0.5 rounded-md font-medium"
                            >
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-espresso-400 mt-1">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-burgundy-900">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-[10px] text-espresso-400">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-cream-50 space-y-2 text-xs">
              <div className="flex justify-between text-espresso-600">
                <span>Items Subtotal</span>
                <span>{formatPrice(order.itemsPrice || order.totalPrice)}</span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.discountPrice)}</span>
                </div>
              )}
              <div className="flex justify-between text-espresso-600">
                <span>Shipping &amp; Delivery</span>
                <span>{order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : "FREE"}</span>
              </div>
              <div className="border-t border-blush-200 pt-2 flex justify-between font-bold text-sm text-burgundy-900">
                <span>Total Amount</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            {/* Delivery & Payment Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-blush-100 pt-4">
              <div>
                <span className="font-bold text-burgundy-900 block mb-1 uppercase tracking-wider text-[10px]">
                  Shipping Destination
                </span>
                <p className="font-medium text-slate-800">{order.shippingAddress?.name}</p>
                <p className="text-espresso-500">{order.shippingAddress?.line1}</p>
                {order.shippingAddress?.line2 && (
                  <p className="text-espresso-500">{order.shippingAddress?.line2}</p>
                )}
                <p className="text-espresso-500">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.postalCode}
                </p>
                <p className="text-espresso-500 mt-1">Phone: {order.shippingAddress?.phone}</p>
              </div>

              <div>
                <span className="font-bold text-burgundy-900 block mb-1 uppercase tracking-wider text-[10px]">
                  Payment Summary
                </span>
                <p className="font-medium text-slate-800 uppercase">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Gateway (Razorpay)"}
                </p>
                <p className="text-espresso-500 mt-0.5">
                  Status:{" "}
                  <span className={order.isPaid ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                    {order.isPaid ? "Paid & Verified" : "Payable on Delivery"}
                  </span>
                </p>
                {order.paymentResult?.razorpayPaymentId && (
                  <p className="text-[10px] text-espresso-400 mt-1 font-mono">
                    Ref: {order.paymentResult.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-8 print:hidden">
          <Link to="/orders" className="btn-outline text-xs">
            My Order History
          </Link>
          <Link to="/shop" className="btn-primary text-xs">
            Explore More Keepsakes
          </Link>
        </div>
      </div>
    </div>
  );
}
