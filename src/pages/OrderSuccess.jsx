import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Printer,
  Truck,
  Copy,
  Check,
  Gift,
  ArrowRight,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, assetUrl } from "../api/client";
import OrderItemPersonalization from "../components/OrderItemPersonalization";
import InvoiceButton from "../components/InvoiceButton";
import { useSeo } from "../utils/seo";

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrderSuccess() {
  useSeo({ title: "Order Placed", noindex: true });
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {
        toast.error("Could not load order details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Paid online but not confirmed yet (webhook may take a few seconds)
  const awaitingPayment = Boolean(order?.awaitingPayment);
  useEffect(() => {
    if (!awaitingPayment) return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      api
        .get(`/orders/${id}`)
        .then(({ data }) => setOrder(data.order))
        .catch(() => {});
      if (attempts >= 20) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [awaitingPayment, id]);

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
          We couldn&apos;t locate the order details. Please check your order history.
        </p>
        <Link to="/orders" className="btn-primary inline-block">
          View My Orders
        </Link>
      </div>
    );
  }

  const shortId = order._id.slice(-8).toUpperCase();

  return (
    <>
      {/* 1. SCREEN VIEW ONLY (Hidden during window.print) */}
      <div className="print:hidden bg-[#FAF7F2] min-h-screen py-8 sm:py-12">
        <div className="container-page max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Celebration Header & Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-blush-200/80 shadow-sm"
          >
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="inline-flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-burgundy-900 to-ribbon-500 text-cream-50 shadow-lg shadow-rose-900/20">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Order Confirmed
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cream-100/80 border border-blush-200 text-xs">
                    <span className="text-espresso-400">Ref:</span>
                    <span className="font-mono font-bold text-burgundy-900">#{shortId}</span>
                    <button
                      onClick={copyOrderId}
                      className="text-ribbon-500 hover:text-burgundy-900 transition p-0.5"
                      title="Copy Full Order ID"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-burgundy-900 leading-tight">
                  Thank You! Your Story is Being Crafted
                </h1>
                <p className="text-xs sm:text-sm text-espresso-500 mt-1 max-w-xl">
                  {awaitingPayment
                    ? "Confirming your payment — this usually takes a few seconds."
                    : "Queued in our studio atelier. Our master 3D artists are preparing your bespoke keepsakes with love and precision."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-blush-100">
              <Link
                to={`/track-order?id=${order._id}`}
                className="btn-primary py-2.5 px-4 sm:px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Truck size={15} />
                <span>Track Order</span>
              </Link>
              <button
                onClick={handlePrint}
                className="btn-outline py-2.5 px-4 sm:px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 bg-white"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
              <InvoiceButton
                order={order}
                label="Download Invoice"
                className="btn-outline py-2.5 px-4 sm:px-5 text-xs font-bold uppercase tracking-wider bg-white"
              />
            </div>
          </motion.div>

          {/* 2-Column Desktop Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Items, Studio Queue, Gift Options) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Keepsake Studio Production Card */}
              <div className="bg-white rounded-3xl border border-blush-200/80 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-ribbon-700 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg tracking-tight">The Ribbon Story</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/20">
                        Keepsake Atelier
                      </span>
                    </div>
                    <p className="text-xs text-rose-100/80 mt-0.5">
                      Handcrafted 3D Sculptures, Keepsakes &amp; Personalized Hampers
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-rose-200/80 text-[11px] block">Order Date</span>
                    <span className="font-bold">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Delivery & Status Bar */}
                <div className="p-4 sm:p-5 bg-cream-50/60 border-b border-blush-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blush-100 text-burgundy-900 shrink-0">
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-burgundy-900">
                        Status: <span className="text-ribbon-600 capitalize font-bold">{order.status || "Confirmed"}</span>
                      </div>
                      <div className="text-[11px] text-espresso-400 mt-0.5">
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
                    to={`/track-order?id=${order._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-ribbon-600 hover:text-burgundy-900 transition self-start sm:self-auto"
                  >
                    <span>View Timeline</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Itemized Keepsakes */}
                <div className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 pb-2 border-b border-blush-100">
                    Keepsakes in Order ({order.items.length})
                  </h2>
                  <div className="divide-y divide-blush-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-1 last:pb-1 flex items-start gap-4 sm:gap-5">
                        <img
                          src={assetUrl(item.image)}
                          alt={item.name}
                          className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover bg-rose-50 border border-blush-200 shrink-0 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                            <h3 className="text-xs sm:text-sm font-bold text-burgundy-900">
                              {item.name}
                            </h3>
                            <div className="sm:text-right shrink-0 mt-1 sm:mt-0">
                              <div className="text-xs sm:text-sm font-bold text-burgundy-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                              <div className="text-[10px] text-espresso-400">
                                {formatPrice(item.price)} each × {item.quantity}
                              </div>
                            </div>
                          </div>

                          {item.customization?.category && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-espresso-500">
                              <span className="font-semibold text-burgundy-900">Category:</span> {item.customization.category}
                              {item.customization.size && (
                                <>
                                  <span className="text-espresso-300">•</span>
                                  <span>{item.customization.size}</span>
                                </>
                              )}
                            </div>
                          )}

                          {item.selectedOptions?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {item.selectedOptions.map((o) => (
                                <span
                                  key={o.name}
                                  className="text-[10px] bg-cream-100 text-espresso-700 px-2.5 py-0.5 rounded-full font-medium border border-blush-200/60"
                                >
                                  {o.name}: {o.value}
                                </span>
                              ))}
                            </div>
                          )}

                          <OrderItemPersonalization item={item} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gift Wrapping Details (if selected) */}
              {order.giftOptions?.isGift && (
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900">
                      <Gift size={16} className="text-ribbon-500" />
                      <span>Complimentary Luxury Gift Packaging</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      Ribbon: {order.giftOptions.ribbonColor || "Classic Ribbon"}
                    </span>
                  </div>
                  {order.giftOptions.cardTheme && (
                    <p className="text-xs text-espresso-600">
                      <span className="font-semibold">Greeting Card:</span> {order.giftOptions.cardTheme}
                    </p>
                  )}
                  {order.giftOptions.giftMessage && (
                    <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 text-xs italic text-burgundy-900 leading-relaxed">
                      &ldquo;{order.giftOptions.giftMessage}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (Order Summary, Shipping Destination, Support) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Order Pricing & Payment Summary */}
              <div className="bg-white rounded-3xl border border-blush-200/80 shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 pb-2 border-b border-blush-100">
                  Payment &amp; Summary
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-espresso-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold">{formatPrice(order.itemsPrice || order.totalPrice)}</span>
                  </div>
                  {order.discountPrice > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                      <span>-{formatPrice(order.discountPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-espresso-600">
                    <span>Shipping &amp; Delivery</span>
                    <span className="font-semibold">{order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : "FREE"}</span>
                  </div>
                  <div className="border-t border-blush-200 pt-3 flex justify-between items-baseline font-bold text-burgundy-900">
                    <span className="text-sm">Grand Total</span>
                    <span className="text-xl font-display text-ribbon-600">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                {/* Payment Method Badge */}
                <div className="p-3.5 rounded-2xl bg-cream-50 border border-blush-100 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-espresso-400">Payment Mode</div>
                  <div className="font-bold text-burgundy-900">
                    {order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Payment (Prepaid)"}
                  </div>
                  <div className="text-[11px] font-medium">
                    Status:{" "}
                    <span className={order.isPaid ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                      {order.isPaid ? "Paid & Verified" : "Payable on Delivery"}
                    </span>
                  </div>
                  {order.paymentResult?.razorpayPaymentId && (
                    <div className="text-[10px] text-espresso-400 font-mono mt-1 pt-1 border-t border-blush-100">
                      Ref: {order.paymentResult.razorpayPaymentId}
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="bg-white rounded-3xl border border-blush-200/80 shadow-sm p-5 sm:p-6 space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 pb-2 border-b border-blush-100">
                  Delivery Destination
                </h2>
                <div className="text-xs space-y-1 text-espresso-600">
                  <p className="font-bold text-burgundy-900 text-sm">{order.shippingAddress?.name}</p>
                  <p>{order.shippingAddress?.line1}</p>
                  {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
                  <p className="font-medium text-slate-800">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-[11px] text-espresso-500 pt-1">
                    Contact: <span className="font-mono font-medium">{order.shippingAddress?.phone}</span>
                  </p>
                </div>
              </div>

              {/* Studio Concierge / Need Help */}
              <div className="bg-gradient-to-br from-cream-100/90 to-blush-50/60 rounded-3xl border border-blush-200/80 p-5 space-y-2 text-xs">
                <div className="font-bold text-burgundy-900 text-xs flex items-center gap-2">
                  <span>Studio Concierge</span>
                </div>
                <p className="text-[11px] text-espresso-500 leading-relaxed">
                  Every keepsake is customized and finished individually by our 3D artisans. If you have any notes or modifications, reach out with reference <strong>#{shortId}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <a
                    href="mailto:contact@theribbonstory.com"
                    className="text-ribbon-600 hover:text-burgundy-900 font-bold underline transition"
                  >
                    contact@theribbonstory.com
                  </a>
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/orders" className="btn-outline flex-1 text-center py-2.5 text-xs font-bold uppercase">
                  Order History
                </Link>
                <Link to="/shop" className="btn-primary flex-1 text-center py-2.5 text-xs font-bold uppercase">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED PRINT RECEIPT (Only visible during window.print) */}
      <div className="hidden print:block bg-white text-slate-900 font-sans p-6 max-w-3xl mx-auto">
        {/* Receipt Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
              The Ribbon Story
            </h1>
            <p className="text-xs font-semibold text-slate-600 tracking-wide mt-0.5">
              Bespoke 3D Sculptures, Keepsakes &amp; Personalized Hampers
            </p>
            <p className="text-xs text-slate-500 mt-1">contact@theribbonstory.com</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Official Store Receipt
            </span>
            <span className="text-lg font-mono font-bold text-slate-900 block mt-0.5">
              #{shortId}
            </span>
            <span className="text-xs text-slate-500 block mt-1">
              Date:{" "}
              {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              Status: <span className="uppercase">{order.status || "Confirmed"}</span>
            </span>
          </div>
        </div>

        {/* Customer & Delivery / Payment Grid */}
        <div className="grid grid-cols-2 gap-6 pb-5 mb-5 border-b border-slate-200 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Shipping Destination:
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.shippingAddress?.name}</p>
            <p className="text-slate-600">{order.shippingAddress?.line1}</p>
            {order.shippingAddress?.line2 && <p className="text-slate-600">{order.shippingAddress?.line2}</p>}
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
              {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-600 mt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Payment &amp; Delivery Details:
            </span>
            <p className="font-bold text-slate-900">
              {order.paymentMethod === "cod" ? "Cash on Delivery (COD)" : "Online Payment (Prepaid)"}
            </p>
            <p className="text-slate-600 mt-0.5">
              Payment Status:{" "}
              <span className="font-semibold">
                {order.isPaid ? "Paid & Verified" : "Payable on Delivery"}
              </span>
            </p>
            {order.paymentResult?.razorpayPaymentId && (
              <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                Txn Ref: {order.paymentResult.razorpayPaymentId}
              </p>
            )}
            <p className="text-slate-600 mt-2">
              <span className="font-semibold">Delivery Slot:</span> {order.deliverySlot || "Standard Daytime"}
            </p>
            {order.scheduledDeliveryDate && (
              <p className="text-slate-600">
                Scheduled:{" "}
                {new Date(order.scheduledDeliveryDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Gift Packaging note (if selected) */}
        {order.giftOptions?.isGift && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs mb-5 space-y-1">
            <div className="font-bold text-slate-900">Complimentary Gift Packaging Included</div>
            {order.giftOptions.ribbonColor && (
              <p className="text-slate-600">Ribbon Style: {order.giftOptions.ribbonColor}</p>
            )}
            {order.giftOptions.cardTheme && (
              <p className="text-slate-600">Greeting Card Theme: {order.giftOptions.cardTheme}</p>
            )}
            {order.giftOptions.giftMessage && (
              <p className="italic text-slate-700 mt-1">&ldquo;{order.giftOptions.giftMessage}&rdquo;</p>
            )}
          </div>
        )}

        {/* Items Table */}
        <div className="mb-5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-left">
                <th className="py-2 font-bold uppercase tracking-wider text-slate-700">Keepsake / Item</th>
                <th className="py-2 text-center font-bold uppercase tracking-wider text-slate-700 w-16">Qty</th>
                <th className="py-2 text-right font-bold uppercase tracking-wider text-slate-700 w-24">Rate</th>
                <th className="py-2 text-right font-bold uppercase tracking-wider text-slate-700 w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, idx) => {
                const c = item.customization || {};
                const inscription = [c.customName, c.customDate].filter(Boolean).join(" · ");
                return (
                  <tr key={idx}>
                    <td className="py-3 pr-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      {(c.category || c.size) && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {[c.category && `Category: ${c.category}`, c.size && `Size: ${c.size}`]
                            .filter(Boolean)
                            .join(" | ")}
                        </div>
                      )}
                      {item.selectedOptions?.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" · ")}
                        </div>
                      )}
                      {inscription && (
                        <div className="text-[11px] text-slate-700 mt-0.5">
                          Inscription: <span className="font-semibold text-slate-900">{inscription}</span>
                        </div>
                      )}
                      {c.note && (
                        <div className="text-[11px] italic text-slate-500 mt-0.5">
                          &ldquo;{c.note}&rdquo;
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center text-slate-900 font-semibold">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-700">{formatPrice(item.price)}</td>
                    <td className="py-3 text-right text-slate-900 font-bold">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Price Breakdown */}
        <div className="border-t-2 border-slate-900 pt-4 mb-6 flex justify-end text-xs">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(order.itemsPrice || order.totalPrice)}
              </span>
            </div>
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                <span>-{formatPrice(order.discountPrice)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Shipping &amp; Delivery:</span>
              <span className="font-semibold text-slate-900">
                {order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : "FREE"}
              </span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-bold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-base">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-700">
            Thank you for trusting The Ribbon Story with your keepsake!
          </p>
          <p>
            Each figurine is custom-sculpted and inspected individually. For any assistance, contact contact@theribbonstory.com
          </p>
        </div>
      </div>
    </>
  );
}
