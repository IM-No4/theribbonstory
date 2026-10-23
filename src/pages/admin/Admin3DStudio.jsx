import { useState, useEffect, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Sparkles,
  Upload,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Clock,
  Layers,
  ArrowRight,
  FileCheck,
  Save,
  X,
  FileCode,
  Sliders,
  User,
  ShoppingBag,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { api, assetUrl } from "../../api/client";

const PRODUCTION_STAGES = [
  { key: "all", label: "All Keepsake Orders" },
  { key: "pending_design", label: "Awaiting 3D Stylization", color: "amber" },
  { key: "cute_ready", label: "Cute Design Ready", color: "sky" },
  { key: "model_ready", label: "3D Model Ready", color: "purple" },
  { key: "queued_for_print", label: "Queued for 3D Print", color: "indigo" },
  { key: "printed", label: "Completed & Printed", color: "emerald" },
];

const STAGE_META = {
  pending_design: {
    label: "Awaiting 3D Stylization",
    bg: "bg-amber-950/60",
    text: "text-amber-400",
    border: "border-amber-800/60",
    badge: "bg-amber-500",
  },
  cute_ready: {
    label: "Cute 3D Design Ready",
    bg: "bg-sky-950/60",
    text: "text-sky-300",
    border: "border-sky-800/60",
    badge: "bg-sky-500",
  },
  model_ready: {
    label: "3D Model Attached",
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-800/60",
    badge: "bg-purple-500",
  },
  queued_for_print: {
    label: "Queued for Printing",
    bg: "bg-indigo-950/60",
    text: "text-indigo-300",
    border: "border-indigo-800/60",
    badge: "bg-indigo-500",
  },
  printed: {
    label: "Printed & Complete",
    bg: "bg-emerald-950/60",
    text: "text-emerald-400",
    border: "border-emerald-800/60",
    badge: "bg-emerald-500",
  },
};

export default function Admin3DStudio() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Modal inspection states
  const [compareModal, setCompareModal] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeStage !== "all") params.append("status", activeStage);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const { data } = await api.get(`/3d-studio/orders?${params.toString()}`);
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.warn("Could not load keepsake orders:", err);
      toast.error("Could not fetch keepsake orders from server");
    } finally {
      setLoading(false);
    }
  }, [activeStage, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDownloadAsset = (fileUrl, downloadName) => {
    if (!fileUrl) return;
    const downloadEndpoint = `${api.defaults.baseURL || "/api"}/3d-studio/download?fileUrl=${encodeURIComponent(
      fileUrl
    )}&downloadName=${encodeURIComponent(downloadName)}`;
    window.open(downloadEndpoint, "_blank");
  };

  // Upload Cute 3D Keepsake Image
  const handleUploadCuteImage = async (orderId, itemIndex, file) => {
    if (!file) return;
    const key = `${orderId}-${itemIndex}-cute`;
    setUpdatingItemId(key);
    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading cute 3D keepsake render...");
    try {
      const { data } = await api.post(
        `/3d-studio/orders/${orderId}/items/${itemIndex}/upload-cute`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(data.message || "Cute 3D render uploaded!", { id: toastId });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload cute image", { id: toastId });
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Upload 3D Model File (.3mf / .obj / .stl)
  const handleUploadModelFile = async (orderId, itemIndex, file) => {
    if (!file) return;
    const key = `${orderId}-${itemIndex}-model`;
    setUpdatingItemId(key);
    const formData = new FormData();
    formData.append("model", file);

    const toastId = toast.loading("Uploading 3D model file (.3mf / .obj)...");
    try {
      const { data } = await api.post(
        `/3d-studio/orders/${orderId}/items/${itemIndex}/upload-model`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(data.message || "3D model file attached!", { id: toastId });
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload 3D model file", { id: toastId });
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Update Workshop Status & Notes
  const handleUpdateStatus = async (orderId, itemIndex, productionStatus, productionNotes) => {
    const key = `${orderId}-${itemIndex}-status`;
    setUpdatingItemId(key);
    try {
      await api.patch(`/3d-studio/orders/${orderId}/items/${itemIndex}/status`, {
        productionStatus,
        productionNotes,
      });
      toast.success("Workshop production status updated");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Box size={16} />
            <span>Order-Linked Keepsake Production Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-3">
            <span>Tripo 3D Keepsake Studio & Workshop</span>
            <span className="text-xs bg-rose-950/90 text-rose-300 border border-rose-800/60 px-3 py-1 rounded-full font-sans font-semibold">
              Industrial FDM Ready
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
            Custom orders arrive with customer source photos intact. Download the photo, generate a stylized cute
            3D figurine with ChatGPT / Midjourney, upload the cute preview here against the product, convert to a 3D mesh
            in Tripo Studio, and archive the 3D model file (<code className="text-rose-300 text-xs font-mono">.3mf</code>,{" "}
            <code className="text-rose-300 text-xs font-mono">.obj</code>) for precision 3D printing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://platform.tripo3d.ai"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition group"
          >
            <span>Open Tripo Studio</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </a>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Refresh Orders"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-rose-400" : ""} />
          </button>
        </div>
      </div>

      {/* Workshop Workflow Guide Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Sparkles size={14} className="text-amber-400" />
          <span>Workshop Step-by-Step Production SOP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Download Photo</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Click download on the customer’s attached source photo intact with the order.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Style Cute 3D Version</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Prompt ChatGPT / Midjourney to craft the cute 3D figurine look and upload it here.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Convert on Tripo</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Feed the cute render into Tripo Studio to reconstruct the 3D printable mesh.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
            <span className="h-6 w-6 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center justify-center font-bold text-xs shrink-0">
              4
            </span>
            <div>
              <div className="font-bold text-white mb-0.5">Attach .3MF & Print</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Attach the generated .3mf / .obj file to keep track and send to 3D slicer!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Custom Orders
            </span>
            <span className="text-2xl font-bold font-display text-white mt-1 block">
              {stats.totalOrders || 0}
            </span>
            <span className="text-[11px] text-slate-500">{stats.totalKeepsakeItems || 0} items with photos</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
              Awaiting Cute Design
            </span>
            <span className="text-2xl font-bold font-display text-amber-400 mt-1 block">
              {stats.pendingDesignCount || 0}
            </span>
            <span className="text-[11px] text-slate-500">Need ChatGPT stylization</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
              Cute Design Ready
            </span>
            <span className="text-2xl font-bold font-display text-sky-400 mt-1 block">
              {stats.cuteReadyCount || 0}
            </span>
            <span className="text-[11px] text-slate-500">Ready for Tripo 3D</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block">
              3D Model Attached
            </span>
            <span className="text-2xl font-bold font-display text-purple-400 mt-1 block">
              {stats.modelReadyCount || 0}
            </span>
            <span className="text-[11px] text-slate-500">.3MF / .OBJ files saved</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Printed & Complete
            </span>
            <span className="text-2xl font-bold font-display text-emerald-400 mt-1 block">
              {stats.printedCount || 0}
            </span>
            <span className="text-[11px] text-slate-500">Precision 3D fulfilled</span>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {PRODUCTION_STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveStage(s.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeStage === s.key
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order #, customer, keepsake..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500 transition"
          />
        </div>
      </div>

      {/* Keepsake Orders List */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3">
          <RefreshCw size={28} className="animate-spin text-rose-500" />
          <p className="text-sm font-semibold text-slate-300">Loading incoming keepsake orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
          <Box size={40} className="mx-auto text-slate-700" />
          <div className="text-base font-bold text-white">No Custom Keepsake Orders Found</div>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            {activeStage !== "all" || searchQuery
              ? "No orders match the selected filter or search term. Try resetting the filters."
              : "When customers place orders with custom photos (for 3D keepsakes or personalized gifts), they will appear here automatically with their photo intact."}
          </p>
          {(activeStage !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setActiveStage("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:border-slate-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl shadow-black/40"
            >
              {/* Order Header Summary */}
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
                    Order #{String(order._id).slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      order.paymentMethod === "cod"
                        ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                        : order.isPaid
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        : "bg-rose-950/60 text-rose-300 border-rose-800/60"
                    }`}
                  >
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : order.isPaid
                      ? "Paid Online"
                      : "Awaiting Payment"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-slate-300 flex items-center gap-1.5">
                    <User size={13} className="text-rose-400" />
                    <span>{order.shippingAddress?.name || order.user?.name || "Customer"}</span>
                    {order.shippingAddress?.phone && (
                      <span className="text-slate-500 font-mono text-[11px]">
                        ({order.shippingAddress.phone})
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/admin/orders?search=${String(order._id).slice(-6)}`}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>View Full Order</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>

              {/* Keepsake Items within this Order */}
              <div className="p-6 space-y-6 divide-y divide-slate-800/60">
                {order.keepsakeItems.map((item) => (
                  <KeepsakeItemRow
                    key={`${order._id}-${item.itemIndex}`}
                    order={order}
                    item={item}
                    onDownloadAsset={handleDownloadAsset}
                    onUploadCuteImage={handleUploadCuteImage}
                    onUploadModelFile={handleUploadModelFile}
                    onUpdateStatus={handleUpdateStatus}
                    updatingItemId={updatingItemId}
                    onOpenCompare={(itemData) => setCompareModal(itemData)}
                    onZoom={(imgUrl) => setZoomImage(imgUrl)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare Side-by-Side Modal */}
      {compareModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setCompareModal(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  3D Keepsake Design Comparison: Original Photo vs. Cute 3D Render
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{compareModal.name}</p>
              </div>
              <button
                onClick={() => setCompareModal(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Original Customer Photograph
                </span>
                <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                  <img
                    src={assetUrl(compareModal.customization?.photoUrl)}
                    alt="Original"
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* Cute 3D Render */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Cute 3D Keepsake Render (Ready for Tripo)
                </span>
                <div className="h-80 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden">
                  <img
                    src={assetUrl(
                      compareModal.customization?.cuteImageUrl ||
                        compareModal.customization?.reference3D?.approvedPreview
                    )}
                    alt="Cute 3D Design"
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              </div>
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
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 text-white border border-slate-700 shadow-xl"
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

// Individual Custom Keepsake Item Component
function KeepsakeItemRow({
  order,
  item,
  onDownloadAsset,
  onUploadCuteImage,
  onUploadModelFile,
  onUpdateStatus,
  updatingItemId,
  onOpenCompare,
  onZoom,
}) {
  const c = item.customization || {};
  const currentStatus = c.productionStatus || "pending_design";
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(c.productionNotes || "");

  const cuteInputId = useId();
  const modelInputId = useId();

  const isUpdatingStatus = updatingItemId === `${order._id}-${item.itemIndex}-status`;
  const isUpdatingCute = updatingItemId === `${order._id}-${item.itemIndex}-cute`;
  const isUpdatingModel = updatingItemId === `${order._id}-${item.itemIndex}-model`;

  const meta = STAGE_META[currentStatus] || STAGE_META.pending_design;

  const originalPhotoUrl = c.photoUrl;
  const cuteImageUrl = c.cuteImageUrl || c.reference3D?.approvedPreview;
  const model3dUrl = c.model3dUrl;

  const originalDownloadName = `Order_${String(order._id).slice(-6).toUpperCase()}_${item.name.replace(
    /\s+/g,
    "_"
  )}_Customer_Photo.webp`;

  const cuteDownloadName = `Order_${String(order._id).slice(-6).toUpperCase()}_${item.name.replace(
    /\s+/g,
    "_"
  )}_Cute_3D_Render.webp`;

  const modelDownloadName =
    c.model3dFilename ||
    `Order_${String(order._id).slice(-6).toUpperCase()}_${item.name.replace(/\s+/g, "_")}.3mf`;

  return (
    <div className="pt-6 first:pt-0 space-y-5">
      {/* Product Details & Status Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={assetUrl(item.image)}
            alt={item.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
          />
          <div>
            <div className="font-display font-bold text-white text-sm flex items-center gap-2">
              <span>{item.name}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">× {item.quantity}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>₹{item.price}</span>
              {c.size && <span>• Size: {c.size}</span>}
              {c.customName && <span>• Name: <strong className="text-rose-300">{c.customName}</strong></span>}
              {c.customDate && <span>• Date: {c.customDate}</span>}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 text-xs font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
          <span className={`h-2 w-2 rounded-full ${meta.badge} animate-pulse`} />
          <span>{meta.label}</span>
        </div>
      </div>

      {/* Customer Note / Special Instructions */}
      {c.note && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-start gap-2">
          <Info size={15} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Customer Story / Inscription:</span>{" "}
            <span className="text-slate-400 italic">"{c.note}"</span>
          </div>
        </div>
      )}

      {/* 3-Column Production Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Customer Source Photo (Intact) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Customer Source Photo</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Intact with Order</span>
              </span>
            </div>

            {originalPhotoUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center group">
                <img
                  src={assetUrl(originalPhotoUrl)}
                  alt="Customer source"
                  className="max-h-full max-w-full object-contain cursor-pointer transition group-hover:scale-105 duration-300"
                  onClick={() => onZoom(originalPhotoUrl)}
                />
                <button
                  onClick={() => onZoom(originalPhotoUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 transition"
                >
                  <Eye size={12} />
                  <span>Zoom</span>
                </button>
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-slate-950 border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center">
                <AlertCircle size={24} className="mb-1 text-slate-600" />
                <span>No customer photo uploaded</span>
              </div>
            )}
          </div>

          {originalPhotoUrl && (
            <button
              onClick={() => onDownloadAsset(originalPhotoUrl, originalDownloadName)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
            >
              <Download size={13} />
              <span>Download Customer Photo</span>
            </button>
          )}
        </div>

        {/* Step 2: Cute 3D Keepsake Version (ChatGPT / Midjourney) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Cute 3D Keepsake Render</span>
              </span>

              {cuteImageUrl && (
                <button
                  onClick={() => onOpenCompare(item)}
                  className="text-[10px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold hover:underline"
                >
                  <Eye size={11} />
                  <span>Compare</span>
                </button>
              )}
            </div>

            {cuteImageUrl ? (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square flex items-center justify-center group">
                <img
                  src={assetUrl(cuteImageUrl)}
                  alt="Cute 3D version"
                  className="max-h-full max-w-full object-contain cursor-pointer transition group-hover:scale-105 duration-300"
                  onClick={() => onZoom(cuteImageUrl)}
                />
                <button
                  onClick={() => onZoom(cuteImageUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-[10px] flex items-center gap-1 transition"
                >
                  <Eye size={12} />
                  <span>Zoom</span>
                </button>
              </div>
            ) : (
              <label
                htmlFor={cuteInputId}
                className="aspect-square rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-sky-500/60 flex flex-col items-center justify-center p-4 text-center cursor-pointer group transition"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 text-sky-400 group-hover:scale-110 transition duration-300 mb-2">
                  <Upload size={20} />
                </div>
                <div className="text-xs font-bold text-white">Upload Cute 3D Render</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Stylized in ChatGPT / Midjourney
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP</div>
              </label>
            )}

            <input
              id={cuteInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadCuteImage(order._id, item.itemIndex, file);
              }}
              disabled={isUpdatingCute}
            />
          </div>

          <div className="flex items-center gap-2">
            {cuteImageUrl ? (
              <>
                <button
                  onClick={() => onDownloadAsset(cuteImageUrl, cuteDownloadName)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition"
                >
                  <Download size={13} />
                  <span>Download Cute Render</span>
                </button>
                <label
                  htmlFor={cuteInputId}
                  className="cursor-pointer px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  title="Replace with new render"
                >
                  <RefreshCw size={13} className={isUpdatingCute ? "animate-spin" : ""} />
                </label>
              </>
            ) : (
              <label
                htmlFor={cuteInputId}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-sky-950/50"
              >
                <Upload size={13} />
                <span>Upload Cute Design</span>
              </label>
            )}
          </div>
        </div>

        {/* Step 3: Tripo 3D Model File (.3mf / .obj / .stl) */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Tripo 3D Model File</span>
              </span>

              <a
                href="https://platform.tripo3d.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 font-semibold hover:underline"
              >
                <span>Tripo.ai</span>
                <ExternalLink size={10} />
              </a>
            </div>

            {model3dUrl ? (
              <div className="aspect-square rounded-xl bg-slate-950 border border-purple-900/50 p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-800/60 text-purple-300">
                  <Box size={28} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[190px]" title={c.model3dFilename}>
                    {c.model3dFilename || "3d_model.3mf"}
                  </div>
                  <div className="text-[10px] text-purple-300 font-mono mt-0.5">
                    {c.model3dSize ? `${(c.model3dSize / (1024 * 1024)).toFixed(1)} MB • ` : ""}
                    Print Ready
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Uploaded{" "}
                  {c.model3dUploadedAt
                    ? new Date(c.model3dUploadedAt).toLocaleDateString()
                    : "recently"}
                </div>
              </div>
            ) : (
              <label
                htmlFor={modelInputId}
                className="aspect-square rounded-xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-purple-500/60 flex flex-col items-center justify-center p-4 text-center cursor-pointer group transition"
              >
                <div className="p-2.5 rounded-xl bg-slate-900 text-purple-400 group-hover:scale-110 transition duration-300 mb-2">
                  <FileCode size={20} />
                </div>
                <div className="text-xs font-bold text-white">Attach 3D Model File</div>
                <div className="text-[11px] text-slate-400 mt-1">Generated via Tripo Studio</div>
                <div className="text-[10px] text-slate-500 mt-0.5">.3mf, .obj, .stl, .glb, .zip</div>
              </label>
            )}

            <input
              id={modelInputId}
              type="file"
              accept=".3mf,.obj,.stl,.glb,.gcode,.zip,.step,.stp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadModelFile(order._id, item.itemIndex, file);
              }}
              disabled={isUpdatingModel}
            />
          </div>

          <div className="flex items-center gap-2">
            {model3dUrl ? (
              <>
                <button
                  onClick={() => onDownloadAsset(model3dUrl, modelDownloadName)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition"
                >
                  <Download size={13} />
                  <span>Download .3MF / Model</span>
                </button>
                <label
                  htmlFor={modelInputId}
                  className="cursor-pointer px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                  title="Replace with updated 3D model"
                >
                  <RefreshCw size={13} className={isUpdatingModel ? "animate-spin" : ""} />
                </label>
              </>
            ) : (
              <label
                htmlFor={modelInputId}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-purple-950/50"
              >
                <Upload size={13} />
                <span>Upload 3D Model (.3MF)</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Workshop Controls & Slicing Notes Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-300 whitespace-nowrap">Production Stage:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-rose-500"
            >
              <option value="pending_design">1. Awaiting 3D Stylization</option>
              <option value="cute_ready">2. Cute 3D Design Ready</option>
              <option value="model_ready">3. 3D Model Attached</option>
              <option value="queued_for_print">4. Queued for 3D Print</option>
              <option value="printed">5. Completed & Printed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Workshop notes: e.g. 0.4mm nozzle, 0.16mm layer, Silk Rose Gold PLA"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <button
          onClick={() => onUpdateStatus(order._id, item.itemIndex, selectedStatus, notes)}
          disabled={isUpdatingStatus}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 disabled:opacity-50"
        >
          <Save size={13} />
          <span>{isUpdatingStatus ? "Saving..." : "Save Status"}</span>
        </button>
      </div>
    </div>
  );
}
