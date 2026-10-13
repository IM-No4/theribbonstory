import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Truck,
  Eye,
  ExternalLink,
  X,
  User,
  MapPin,
  Download,
  Calendar,
  RotateCcw,
  AlertTriangle,
  CreditCard,
  Box,
  Sparkles,
  RefreshCw,
  Upload,
  FileCode,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";
import { blobErrorMessage, downloadPrintFile, formatBytes } from "../../utils/printFiles";
import { downloadFromApi } from "../../utils/download";
import InvoiceButton from "../../components/InvoiceButton";

const STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [liveTrackingModal, setLiveTrackingModal] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [liveTrackingData, setLiveTrackingData] = useState(null);

  // Refund Modal State
  const [refundModal, setRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("Customer requested cancellation");
  const [refunding, setRefunding] = useState(false);

  // Personalized Keepsake Asset States
  const [uploadingItemKey, setUploadingItemKey] = useState(null);
  const [generatingChibiKey, setGeneratingChibiKey] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const handleGenerateChibi = async (orderId, itemIndex) => {
    const key = `${orderId}-${itemIndex}`;
    setGeneratingChibiKey(key);
    const toastId = toast.loading("Generating 3D Chibi figurine via Qwen Turbo AI...");
    try {
      const { data } = await api.post(`/chibi/orders/${orderId}/items/${itemIndex}/generate`);
      toast.success("Cute 3D Chibi figurine generated successfully!", { id: toastId });
      if (data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      console.error("Chibi generation failed:", err);
      toast.error(err.response?.data?.error || "AI Chibi generation failed. Please try again.", { id: toastId });
    } finally {
      setGeneratingChibiKey(null);
    }
  };

  const handleUploadCuteImage = async (orderId, itemIndex, file) => {
    if (!file) return;
    const key = `${orderId}-${itemIndex}-cute`;
    setUploadingItemKey(key);
    const formData = new FormData();
    formData.append("image", file);
    const toastId = toast.loading("Uploading cute version image...");
    try {
      const { data } = await api.post(
        `/3d-studio/orders/${orderId}/items/${itemIndex}/upload-cute`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Cute version image uploaded!", { id: toastId });
      if (data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload cute image", { id: toastId });
    } finally {
      setUploadingItemKey(null);
    }
  };

  const handleUploadModelFile = async (orderId, itemIndex, file) => {
    if (!file) return;
    const key = `${orderId}-${itemIndex}-model`;
    setUploadingItemKey(key);
    const formData = new FormData();
    formData.append("model", file);
    const toastId = toast.loading("Attaching 3D model file...");
    try {
      const { data } = await api.post(
        `/3d-studio/orders/${orderId}/items/${itemIndex}/upload-model`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("3D model file attached (Internal use)!", { id: toastId });
      if (data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload 3D model file", { id: toastId });
    } finally {
      setUploadingItemKey(null);
    }
  };

  const handleDownloadAsset = (fileUrl, downloadName) => {
    if (!fileUrl) return;
    const downloadEndpoint = `${api.defaults.baseURL || "/api"}/3d-studio/download?fileUrl=${encodeURIComponent(
      fileUrl
    )}&downloadName=${encodeURIComponent(downloadName)}`;
    window.open(downloadEndpoint, "_blank");
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders/admin/all", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        },
      });
      setOrders(data.orders || []);
    } catch {
      toast.error("Failed to load customer orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  const openRefundModal = (order) => {
    setRefundModal(order);
    setRefundAmount(order.totalPrice || "");
    setRefundReason(order.cancellationReason || "Customer requested refund");
  };

  const handleProcessRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundModal) return;
    if (!refundAmount || Number(refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    setRefunding(true);
    try {
      const { data } = await api.post(`/orders/${refundModal._id}/refund`, {
        amount: Number(refundAmount),
        reason: refundReason,
      });

      toast.success(data.message || "Refund processed successfully!");
      setRefundModal(null);
      if (selectedOrder && selectedOrder._id === refundModal._id) {
        setSelectedOrder(data.order);
      }
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  const handleOpenLiveTracking = async (order) => {
    setLiveTrackingModal(order);
    setLoadingTracking(true);
    setLiveTrackingData(null);
    try {
      const trackingQuery = order.awbCode || order.trackingNumber || order._id;
      const { data } = await api.get(`/shipping/track/${trackingQuery}`);
      setLiveTrackingData(data);
    } catch {
      toast.error("Could not fetch real-time Shiprocket tracking");
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Server-side CSV of every order in a date range (India time), for accounts and GST
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const today = new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
  const [exportRange, setExportRange] = useState({ from: `${today.slice(0, 8)}01`, to: today });

  const exportOrdersCSV = async () => {
    if (exportRange.from && exportRange.to && exportRange.from > exportRange.to) {
      toast.error("The start date is after the end date");
      return;
    }
    setExporting(true);
    try {
      const res = await downloadFromApi("/orders/admin/export", {
        params: { from: exportRange.from || undefined, to: exportRange.to || undefined, status: statusFilter },
        fallbackName: "orders.csv",
      });
      const count = Number(res.headers["x-order-count"] || 0);
      toast.success(
        res.headers["x-export-truncated"]
          ? `Exported the first ${count} orders. Pick a shorter date range for the rest.`
          : `Exported ${count} order${count === 1 ? "" : "s"}`
      );
      setExportOpen(false);
    } catch (err) {
      toast.error(await blobErrorMessage(err, "Export failed. Please try again."));
    } finally {
      setExporting(false);
    }
  };

  const handleShiprocketDispatch = async (orderId) => {
    setUpdating(true);
    try {
      const { data } = await api.post(`/shipping/create-shipment/${orderId}`);
      toast.success(data.message || "Shiprocket shipment & AWB generated!");
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create Shiprocket shipment");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintLabel = async (orderId) => {
    try {
      const { data } = await api.get(`/shipping/label/${orderId}`);
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
        toast.success("Opening shipping label PDF...");
      } else {
        toast.error("Shipping label not ready yet");
      }
    } catch {
      toast.error("Failed to fetch shipping label");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(data.message || `Status updated to ${newStatus}`);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track gift orders, inspect personalized photo uploads, and manage shipping fulfillment.
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setExportOpen((v) => !v)}
            aria-expanded={exportOpen}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Download size={15} className="text-rose-400" />
            <span>Export Orders CSV</span>
          </button>
          {exportOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-30 w-72 p-4 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl shadow-black/60 space-y-3">
              <p className="text-[11px] text-slate-400">
                Orders placed between these dates (India time)
                {statusFilter !== "all" ? `, status: ${statusFilter}` : ""}. Includes invoice numbers and GST split.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-slate-400 space-y-1">
                  <span>From</span>
                  <input
                    type="date"
                    value={exportRange.from}
                    max={today}
                    onChange={(e) => setExportRange((r) => ({ ...r, from: e.target.value }))}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white [color-scheme:dark]"
                  />
                </label>
                <label className="text-[11px] text-slate-400 space-y-1">
                  <span>To</span>
                  <input
                    type="date"
                    value={exportRange.to}
                    max={today}
                    onChange={(e) => setExportRange((r) => ({ ...r, to: e.target.value }))}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white [color-scheme:dark]"
                  />
                </label>
              </div>
              <button
                onClick={exportOrdersCSV}
                disabled={exporting}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {exporting ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
                <span>{exporting ? "Preparing…" : "Download CSV"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by customer name, order ID, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {STATUSES.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === st.value
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag size={36} className="mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-white">No orders matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer & City</th>
                  <th className="py-3.5 px-4">Scheduled Slot</th>
                  <th className="py-3.5 px-4">Items / Keepsakes</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <tr key={order._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-400">{dateStr}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{order.shippingAddress?.name || order.user?.name || "Customer"}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {order.scheduledDeliveryDate ? (
                          <div>
                            <div className="font-semibold text-rose-300 flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{order.scheduledDeliveryDate}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                              {order.deliverySlot || "Standard"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">Standard Slot</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {order.items?.[0]?.name || "Keepsake"}
                          {order.items?.length > 1 && (
                            <span className="text-slate-400 font-normal">
                              {" "}
                              (+{order.items.length - 1} more)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.items?.reduce((s, i) => s + (i.quantity || 1), 0)} total pcs
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-sm">
                        <div>₹{order.totalPrice}</div>
                        {order.isRefunded && (
                          <div className="text-[10px] text-rose-400 font-normal">
                            Refunded: ₹{order.refundAmount}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit ${
                              order.isPaid
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                                : "bg-amber-950 text-amber-400 border border-amber-800/40"
                            }`}
                          >
                            {order.isPaid ? "Paid" : "COD / Unpaid"}
                          </span>
                          {order.refundStatus === "requested" && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-900/60 text-amber-300 border border-amber-600 animate-pulse w-fit">
                              Refund Req
                            </span>
                          )}
                          {order.isRefunded && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800 w-fit">
                              Refunded
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          disabled={updating}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1 border cursor-pointer ${
                            order.status === "delivered"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : order.status === "shipped"
                              ? "bg-blue-950 text-blue-300 border-blue-800"
                              : order.status === "cancelled"
                              ? "bg-red-950 text-red-300 border-red-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.refundStatus === "requested" && (
                            <button
                              onClick={() => openRefundModal(order)}
                              title="Process Refund Request"
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              <span>Refund</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenLiveTracking(order)}
                            title="Track live with Shiprocket"
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Truck size={12} />
                            <span>Track</span>
                          </button>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                  <span>Order #{selectedOrder._id.slice(-6).toUpperCase()}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedOrder.status === "delivered"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        : "bg-amber-950 text-amber-400 border border-amber-800/40"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  {selectedOrder.invoice?.number && <span className="font-mono">{selectedOrder.invoice.number}</span>}
                  <InvoiceButton
                    order={selectedOrder}
                    label="GST invoice"
                    className="text-rose-300 hover:text-rose-200 font-semibold cursor-pointer"
                  />
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Customer & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
                    <User size={14} />
                    <span>Customer Details</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || "Customer"}
                  </div>
                  <div className="text-slate-400">{selectedOrder.user?.email}</div>
                  <div className="text-slate-400">Phone: {selectedOrder.shippingAddress?.phone}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
                    <MapPin size={14} />
                    <span>Shipping Address</span>
                  </div>
                  <div className="text-white font-medium">{selectedOrder.shippingAddress?.line1}</div>
                  {selectedOrder.shippingAddress?.line2 && (
                    <div className="text-slate-300">{selectedOrder.shippingAddress?.line2}</div>
                  )}
                  <div className="text-slate-400">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                    {selectedOrder.shippingAddress?.postalCode}
                  </div>
                </div>

                {/* Scheduled Celebration Date & Slot */}
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wider text-[11px]">
                    <Calendar size={14} />
                    <span>Scheduled Delivery Details</span>
                  </div>
                  <div className="text-white font-bold text-sm">
                    {selectedOrder.scheduledDeliveryDate
                      ? new Date(selectedOrder.scheduledDeliveryDate).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Standard Processing"}
                  </div>
                  <div className="text-xs text-rose-300 font-medium">
                    Time Slot: {selectedOrder.deliverySlot || "Standard Daytime Slot"}
                  </div>
                </div>
              </div>

              {/* Order Items: Generic vs Personalized Keepsake Requests */}
              <div className="space-y-3">
                <div className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Order Items & Keepsake Requests</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    ({selectedOrder.items?.length || 0} {selectedOrder.items?.length === 1 ? "item" : "items"})
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedOrder.items?.map((item, idx) => {
                    const c = item.customization || {};
                    const isPersonalized = Boolean(c.photoUrl || c.cuteImageUrl || c.model3dUrl);
                    const originalPhotoUrl = c.photoUrl;
                    const cuteImageUrl = c.cuteImageUrl || c.reference3D?.approvedPreview;
                    const model3dUrl = c.model3dUrl;

                    const isCuteUploading = uploadingItemKey === `${selectedOrder._id}-${idx}-cute`;
                    const isModelUploading = uploadingItemKey === `${selectedOrder._id}-${idx}-model`;

                    const originalDownloadName = `Order_${String(selectedOrder._id).slice(-6).toUpperCase()}_${item.name.replace(/\s+/g, "_")}_Customer_Photo.webp`;
                    const cuteDownloadName = `Order_${String(selectedOrder._id).slice(-6).toUpperCase()}_${item.name.replace(/\s+/g, "_")}_Cute_Render.webp`;
                    const modelDownloadName = c.model3dFilename || `Order_${String(selectedOrder._id).slice(-6).toUpperCase()}_${item.name.replace(/\s+/g, "_")}.3mf`;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
                      >
                        {/* Item Header: Product details & Generic vs Personalized badge */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                          <div className="flex gap-3 items-center">
                            <img
                              src={assetUrl(item.image || "/images/photo-magnet.webp")}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{item.name}</span>
                                <span className="text-xs text-slate-400 font-normal">× {item.quantity}</span>
                              </div>
                              <div className="text-xs text-slate-400">
                                ₹{item.price} each • Line total: ₹{item.price * item.quantity}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPersonalized ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1.5">
                                <Sparkles size={11} className="text-rose-400" />
                                <span>Personalized Keepsake</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800">
                                Generic Item
                              </span>
                            )}

                            {/* Production print template if linked */}
                            {item.printFile && (
                              <button
                                type="button"
                                onClick={() =>
                                  downloadPrintFile(item.product, item.printFile.originalName).catch(async (err) =>
                                    toast.error(await blobErrorMessage(err, "Could not download print file"))
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold transition"
                                title={item.printFile.originalName}
                              >
                                <Download size={11} />
                                <span>Print Template</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Selected Options & Customer Inscription / Notes */}
                        {(item.selectedOptions?.length > 0 || c.customName || c.customDate || c.note) && (
                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60 text-xs">
                            {item.selectedOptions?.map((opt, oIdx) => (
                              <span
                                key={oIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-950 text-rose-300 text-[10px] font-mono border border-slate-800"
                              >
                                {opt.name}: {opt.value} {opt.priceDelta > 0 && `(+₹${opt.priceDelta})`}
                              </span>
                            ))}
                            {c.customName && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] border border-slate-800">
                                Inscription: <strong>{c.customName}</strong>
                              </span>
                            )}
                            {c.customDate && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 text-[10px] border border-slate-800">
                                Date: {c.customDate}
                              </span>
                            )}
                            {c.note && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] border border-slate-800 italic">
                                Note: &quot;{c.note}&quot;
                              </span>
                            )}
                          </div>
                        )}

                        {/* Personalized Request Action Row (Customer Photo | Cute Version | 3D Model File) */}
                        {isPersonalized && (
                          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* 1. Customer Source Photo */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                                  1. Customer Source Photo
                                </span>
                                {originalPhotoUrl ? (
                                  <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 h-28 flex items-center justify-center group">
                                    <img
                                      src={assetUrl(originalPhotoUrl)}
                                      alt="Customer photo"
                                      className="max-h-full max-w-full object-contain cursor-pointer transition group-hover:scale-105"
                                      onClick={() => setZoomImage(originalPhotoUrl)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setZoomImage(originalPhotoUrl)}
                                      className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-black text-white text-[9px] flex items-center gap-1 transition"
                                    >
                                      <Eye size={10} />
                                      <span>Zoom</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-28 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                                    No photo attached
                                  </div>
                                )}
                              </div>

                              {originalPhotoUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadAsset(originalPhotoUrl, originalDownloadName)}
                                  className="w-full py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                                >
                                  <Download size={12} />
                                  <span>Download Customer Photo</span>
                                </button>
                              )}
                            </div>

                            {/* 2. Cute Version Image */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                                    2. Cute Version Image
                                  </span>
                                  {sourcePhotoUrl && (
                                    <button
                                      type="button"
                                      disabled={generatingChibiKey === `${selectedOrder._id}-${idx}`}
                                      onClick={() => handleGenerateChibi(selectedOrder._id, idx)}
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer disabled:opacity-50"
                                      title="Generate with Qwen Turbo ZeroGPU"
                                    >
                                      {generatingChibiKey === `${selectedOrder._id}-${idx}` ? (
                                        <>
                                          <RefreshCw size={10} className="animate-spin" />
                                          <span>Generating...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles size={10} />
                                          <span>AI Generate</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {cuteImageUrl ? (
                                  <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 h-28 flex items-center justify-center group">
                                    <img
                                      src={assetUrl(cuteImageUrl)}
                                      alt="Cute version"
                                      className="max-h-full max-w-full object-contain cursor-pointer transition group-hover:scale-105"
                                      onClick={() => setZoomImage(cuteImageUrl)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setZoomImage(cuteImageUrl)}
                                      className="absolute bottom-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-black text-white text-[9px] flex items-center gap-1 transition"
                                    >
                                      <Eye size={10} />
                                      <span>Zoom</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {sourcePhotoUrl && (
                                      <button
                                        type="button"
                                        disabled={generatingChibiKey === `${selectedOrder._id}-${idx}`}
                                        onClick={() => handleGenerateChibi(selectedOrder._id, idx)}
                                        className="w-full py-3 px-2 rounded-lg bg-gradient-to-r from-rose-600 to-ribbon-700 hover:from-rose-500 hover:to-ribbon-600 text-white text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-md shadow-rose-950/40 transition cursor-pointer disabled:opacity-60"
                                      >
                                        <div className="flex items-center gap-1.5">
                                          {generatingChibiKey === `${selectedOrder._id}-${idx}` ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                          ) : (
                                            <Sparkles size={14} />
                                          )}
                                          <span>
                                            {generatingChibiKey === `${selectedOrder._id}-${idx}`
                                              ? "Generating 3D Chibi..."
                                              : "Generate AI Chibi"}
                                          </span>
                                        </div>
                                        <span className="text-[9px] text-rose-200 font-normal">
                                          Qwen Turbo ZeroGPU
                                        </span>
                                      </button>
                                    )}
                                    <label className="h-12 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 hover:border-sky-500/60 flex items-center justify-center p-2 text-center cursor-pointer group transition gap-2">
                                      <Upload size={14} className="text-sky-400 group-hover:scale-110 transition" />
                                      <div className="text-left">
                                        <span className="text-[11px] font-bold text-white block">Or Upload Manually</span>
                                        <span className="text-[9px] text-slate-400 block">PNG, JPG, WebP</span>
                                      </div>
                                      <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleUploadCuteImage(selectedOrder._id, idx, file);
                                        }}
                                        disabled={isCuteUploading}
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>

                              {cuteImageUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadAsset(cuteImageUrl, cuteDownloadName)}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                                  >
                                    <Download size={12} />
                                    <span>Download</span>
                                  </button>
                                  {sourcePhotoUrl && (
                                    <button
                                      type="button"
                                      disabled={generatingChibiKey === `${selectedOrder._id}-${idx}`}
                                      onClick={() => handleGenerateChibi(selectedOrder._id, idx)}
                                      className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                      title="Regenerate with AI"
                                    >
                                      <Sparkles size={11} className={generatingChibiKey === `${selectedOrder._id}-${idx}` ? "animate-spin" : ""} />
                                      <span>Regen</span>
                                    </button>
                                  )}
                                  <label className="cursor-pointer py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition">
                                    <RefreshCw size={11} className={isCuteUploading ? "animate-spin" : ""} />
                                    <span>Replace</span>
                                    <input
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadCuteImage(selectedOrder._id, idx, file);
                                      }}
                                      disabled={isCuteUploading}
                                    />
                                  </label>
                                </div>
                              ) : null}
                            </div>

                            {/* 3. Optional 3D Model File (Internal Use Only) */}
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2.5">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                    3. 3D Model File
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
                                    Internal Use Only
                                  </span>
                                </div>

                                {model3dUrl ? (
                                  <div className="h-28 rounded-lg bg-slate-900 border border-purple-900/50 p-3 flex flex-col items-center justify-center text-center space-y-1">
                                    <Box size={22} className="text-purple-300" />
                                    <div className="text-xs font-bold text-white truncate max-w-[170px]" title={c.model3dFilename}>
                                      {c.model3dFilename || "3d_model.3mf"}
                                    </div>
                                    <div className="text-[10px] text-purple-300 font-mono">
                                      {c.model3dSize ? `${(c.model3dSize / (1024 * 1024)).toFixed(1)} MB • ` : ""}
                                      Bambu Ready
                                    </div>
                                  </div>
                                ) : (
                                  <label className="h-28 rounded-lg bg-slate-900/60 border border-dashed border-slate-800 hover:border-purple-500/60 flex flex-col items-center justify-center p-2 text-center cursor-pointer group transition">
                                    <FileCode size={18} className="text-purple-400 mb-1 group-hover:scale-110 transition" />
                                    <span className="text-xs font-bold text-white">Attach 3D Model</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">.3mf, .obj, .stl, .glb</span>
                                    <span className="text-[9px] text-slate-500 mt-0.5">Optional for workshop</span>
                                    <input
                                      type="file"
                                      accept=".3mf,.obj,.stl,.glb,.gcode,.zip,.step,.stp"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadModelFile(selectedOrder._id, idx, file);
                                      }}
                                      disabled={isModelUploading}
                                    />
                                  </label>
                                )}
                              </div>

                              {model3dUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadAsset(model3dUrl, modelDownloadName)}
                                    className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                                  >
                                    <Download size={12} />
                                    <span>Download .3MF</span>
                                  </button>
                                  <label className="cursor-pointer py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition">
                                    <RefreshCw size={11} className={isModelUploading ? "animate-spin" : ""} />
                                    <span>Replace</span>
                                    <input
                                      type="file"
                                      accept=".3mf,.obj,.stl,.glb,.gcode,.zip,.step,.stp"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadModelFile(selectedOrder._id, idx, file);
                                      }}
                                      disabled={isModelUploading}
                                    />
                                  </label>
                                </div>
                              ) : (
                                <label className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-950/40">
                                  <Upload size={12} />
                                  <span>Attach 3D Model</span>
                                  <input
                                    type="file"
                                    accept=".3mf,.obj,.stl,.glb,.gcode,.zip,.step,.stp"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadModelFile(selectedOrder._id, idx, file);
                                    }}
                                    disabled={isModelUploading}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Shiprocket Logistics Fulfillment Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-indigo-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">Shiprocket Fulfillment</span>
                  </div>
                  {selectedOrder.awbCode ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                      AWB: {selectedOrder.awbCode}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Unfulfilled in Shiprocket
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-300">
                    Assigned Courier: <strong className="text-white">{selectedOrder.courierName || selectedOrder.courierPartner || "BlueDart Express"}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {!selectedOrder.shiprocketShipmentId ? (
                      <button
                        onClick={() => handleShiprocketDispatch(selectedOrder._id)}
                        disabled={updating}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>⚡ Ship with Shiprocket</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePrintLabel(selectedOrder._id)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Download size={14} className="text-emerald-400" />
                        <span>Print Shipping Label PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Refund Notice / Info Box if applicable */}
              {selectedOrder.refundStatus === "requested" && (
                <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/80 flex items-start gap-3">
                  <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Customer Cancellation & Refund Requested
                    </div>
                    <p className="text-slate-300 text-xs">
                      Customer requested cancellation with reason: <em>&quot;{selectedOrder.cancellationReason || "Not specified"}&quot;</em>
                    </p>
                    <button
                      onClick={() => openRefundModal(selectedOrder)}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Review & Issue Refund Now</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.isRefunded && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3">
                  <RotateCcw className="text-rose-400 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-0.5">
                    <div className="font-bold text-rose-300 text-xs uppercase tracking-wider">
                      Refund Processed (₹{selectedOrder.refundAmount})
                    </div>
                    <p className="text-slate-300 text-xs">
                      Reference ID: <span className="font-mono text-white font-bold">{selectedOrder.refundId}</span>
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Reason: {selectedOrder.refundReason} • Date: {new Date(selectedOrder.refundedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.itemsPrice}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charge</span>
                  <span>{selectedOrder.shippingPrice === 0 ? "FREE" : `₹${selectedOrder.shippingPrice}`}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-sm">
                  <span>Total Amount</span>
                  <span className="text-rose-400 font-mono">₹{selectedOrder.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer with quick status change & refund */}
            <div className="p-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950 rounded-b-3xl">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {!selectedOrder.isRefunded && (
                  <button
                    onClick={() => openRefundModal(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>💸 Issue Refund</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Admin Refund Processing Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl shadow-black/90 my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-rose-900/60 border border-rose-700/60 flex items-center justify-center text-rose-400">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Issue Payment Refund
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order #{refundModal._id.slice(-6).toUpperCase()} • {refundModal.paymentMethod === "razorpay" ? "Razorpay Gateway" : "Store / Bank Credit"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRefundModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Customer:</span>
                  <span className="font-bold text-white">{refundModal.shippingAddress?.name || refundModal.user?.name || "Customer"}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Original Order Total:</span>
                  <span className="font-bold text-rose-400 font-mono">₹{refundModal.totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Payment Method:</span>
                  <span className="capitalize text-white font-medium">{refundModal.paymentMethod}</span>
                </div>
                {refundModal.paymentResult?.razorpayPaymentId && (
                  <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                    <span>Razorpay Payment ID:</span>
                    <span className="text-slate-400">{refundModal.paymentResult.razorpayPaymentId}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  Refund Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={refundModal.totalPrice}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Defaults to full amount (₹{refundModal.totalPrice}). You can specify a partial refund if needed.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs mb-2 focus:border-rose-500 focus:outline-hidden"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Damaged or defective keepsake received">Damaged or defective keepsake received</option>
                  <option value="Incorrect 3D model customization or text">Incorrect 3D model customization or text</option>
                  <option value="Delayed delivery beyond scheduled celebration">Delayed delivery beyond scheduled celebration</option>
                  <option value="Other / Goodwill studio refund">Other / Goodwill studio refund</option>
                </select>

                <input
                  type="text"
                  placeholder="Custom internal note or customer explanation..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-200">
                ⚡ Razorpay will automatically credit the customer&apos;s source account (UPI / Card / NetBanking) within 5-7 business days.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refunding}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {refunding ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={14} />
                      <span>Execute ₹{refundAmount || refundModal.totalPrice} Refund</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Shiprocket Tracking Inspector Modal for Admin */}
      {liveTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/90 my-8">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">
                    Shiprocket Live Tracking Radar
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order #{liveTrackingModal._id.slice(-6).toUpperCase()} • AWB:{" "}
                    <span className="font-mono text-indigo-300 font-bold">
                      {liveTrackingModal.awbCode || liveTrackingModal.trackingNumber || "SR-PENDING"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLiveTrackingModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {loadingTracking ? (
                <div className="p-12 text-center space-y-3">
                  <div className="h-7 w-7 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                  <p className="text-slate-400 text-xs font-semibold">
                    Querying Shiprocket Carrier Network...
                  </p>
                </div>
              ) : (
                <>
                  {/* Carrier & AWB Overview Card */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Carrier Partner</span>
                      <h4 className="font-bold text-sm text-white mt-0.5">
                        {liveTrackingModal.courierName ||
                          liveTrackingModal.courierPartner ||
                          "BlueDart Express (Shiprocket)"}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        AWB: {liveTrackingModal.awbCode || liveTrackingModal.trackingNumber || "SR84729103IN"}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {liveTrackingData?.shiprocketTracking?.shipment_status || liveTrackingModal.status}
                    </span>
                  </div>

                  {/* Checkpoints */}
                  <div className="space-y-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-300 block">
                      Live Checkpoint Scans ({liveTrackingData?.shiprocketTracking?.shipment_track_activities?.length || 0})
                    </span>

                    {liveTrackingData?.shiprocketTracking?.shipment_track_activities?.length > 0 ? (
                      <div className="space-y-4 pl-2 border-l-2 border-slate-800 ml-2 py-1">
                        {liveTrackingData.shiprocketTracking.shipment_track_activities.map((act, idx) => (
                          <div key={idx} className="relative pl-4 space-y-0.5">
                            <div className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-slate-950" />
                            <p className="font-bold text-white text-xs">{act.activity}</p>
                            <p className="text-[11px] text-slate-400">
                              {act.location} • {act.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400">
                        <p>Consignment scheduled for courier pickup. Checkpoints will appear once scanned at regional hub.</p>
                      </div>
                    )}
                  </div>

                  {/* Destination */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Destination Hub</span>
                    <p className="text-white font-medium">
                      {liveTrackingModal.shippingAddress?.name} — {liveTrackingModal.shippingAddress?.city},{" "}
                      {liveTrackingModal.shippingAddress?.state} ({liveTrackingModal.shippingAddress?.postalCode})
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-950 rounded-b-3xl">
              <button
                onClick={() => handleOpenLiveTracking(liveTrackingModal)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                🔄 Refresh Live Scans
              </button>

              <button
                onClick={() => setLiveTrackingModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Zoom Modal */}
      {zoomImage && (
        <div

          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setZoomImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 text-white border border-slate-700 shadow-xl hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
            <img
              src={assetUrl(zoomImage)}
              alt="Zoomed"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl border border-slate-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

