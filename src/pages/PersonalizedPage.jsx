import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Eye,
  X,
  Plus,
  ShoppingBag,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { assetUrl } from "../api/client";
import { useSeo } from "../utils/seo";
import { useKeepsakePreview } from "../hooks/useKeepsakePreview";
import KeepsakeDesignPreview from "../components/KeepsakeDesignPreview";

const SIZES = [
  {
    id: "small",
    name: "Small",
    dimensions: '3.5" (9 cm)',
    price: 699,
    mrp: 1299,
    desc: "Perfect for desk, bedside, or compact spaces",
  },
  {
    id: "medium",
    name: "Medium",
    dimensions: '5.5" (14 cm)',
    price: 1299,
    mrp: 2199,
    popular: true,
    desc: "Most loved size for living rooms & gifts",
  },
  {
    id: "large",
    name: "Large",
    dimensions: '8.0" (20 cm)',
    price: 2199,
    mrp: 3699,
    desc: "Statement collector figurine with high detail",
  },
];

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PersonalizedPage() {
  useSeo({ title: "Create a Personalised 3D Keepsake", description: "Upload a photo, choose a size and add an inscription to create a one-of-a-kind 3D keepsake." });

  const { items, addItem, removeItem, openCart } = useCartStore();
  const fileInputRef = useRef(null);

  // Filter existing personalized items in cart
  const personalizedCartItems = items.filter(
    (item) => item.customization?.photoUrl || item.productId?.startsWith("custom-3d-")
  );

  // Active Keepsake Builder State
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [inscriptionText, setInscriptionText] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Photo -> 3D design preview (the chosen design is what gets printed)
  const preview = useKeepsakePreview();
  const hasPhoto = preview.status !== "idle";
  const [fileName, setFileName] = useState("");
  const [zoomImage, setZoomImage] = useState(null);

  // Lock body scroll and listen for Escape key when fullscreen preview is active
  useEffect(() => {
    if (!zoomImage) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setZoomImage(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomImage]);

  // Photo chosen: create the customer's 3D design preview
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;
    setFileName(file.name);
    preview.upload(file);
  };

  // Reset form for next personalized keepsake
  const handleResetForm = () => {
    preview.reset();
    setFileName("");
    setInscriptionText("");
    setQuantity(1);
    setSelectedSize(SIZES[1]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add customized 3D keepsake to cart
  const handleAddToCart = (continueCustomizing = false) => {
    const design = preview.cartFields();
    if (!design) {
      toast.error("Please upload a photograph and wait for your 3D design");
      return;
    }

    const currentSize = selectedSize || SIZES[1];
    const unitPrice = currentSize.price;
    const uniqueId = `custom-3d-${currentSize.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    addItem({
      productId: uniqueId,
      name: `Custom 3D Keepsake (${currentSize.name} - ${currentSize.dimensions})`,
      image: design.image,
      price: unitPrice,
      sizeId: currentSize.id,
      quantity,
      selectedOptions: [
        { name: "Keepsake Size", value: `${currentSize.name} (${currentSize.dimensions})`, priceDelta: 0 },
      ],
      customization: {
        ...design.customization,
        size: currentSize.name,
        dimensions: currentSize.dimensions,
        customName: inscriptionText.trim(),
        note: inscriptionText.trim(),
      },
    });

    toast.success(`Added ${currentSize.name} keepsake to your order!`);

    if (continueCustomizing) {
      handleResetForm();
    } else {
      openCart();
    }
  };

  return (
    <div className="bg-[#FAF7F5] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-100 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-ribbon-600 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} className="text-ribbon-500" />
              <span>Multi-Item 3D Keepsake Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-burgundy-900 tracking-tight">
              Personalize Your 3D Keepsakes
            </h1>
            <p className="text-xs sm:text-sm text-espresso-400 mt-1">
              Create multiple unique keepsakes in one order with different photos, sizes &amp; custom engraving text.
            </p>
          </div>

          {/* Quick Cart / Keepsake Counter Pill */}
          {personalizedCartItems.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white border border-rose-200 shadow-xs flex items-center gap-2 text-xs">
                <Package size={16} className="text-ribbon-500" />
                <span className="font-bold text-burgundy-900">
                  {personalizedCartItems.length} Keepsake{personalizedCartItems.length > 1 ? "s" : ""} in Order
                </span>
              </div>

              <Link
                to="/checkout"
                className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5"
              >
                <span>Checkout Now</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Active Keepsake Customizer Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100 space-y-6">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4">
                <div className="flex items-center gap-2 font-display font-bold text-lg text-burgundy-900">
                  <span className="w-7 h-7 rounded-xl bg-burgundy-900 text-white flex items-center justify-center text-xs">
                    {personalizedCartItems.length + 1}
                  </span>
                  <span>
                    {hasPhoto
                      ? `Configuring Keepsake #${personalizedCartItems.length + 1}`
                      : "Create a New 3D Keepsake"}
                  </span>
                </div>

                {hasPhoto && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              {/* STEP 1: Upload Photo */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                  1. Upload Photograph *
                </label>

                {!hasPhoto ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-8 sm:p-10 border-2 border-dashed border-rose-200 hover:border-ribbon-500 bg-rose-50/30 hover:bg-rose-50/60 rounded-2xl text-center space-y-3 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-rose-100 text-ribbon-600 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-2xs">
                      <Upload size={22} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-burgundy-900">
                        Click to select or drop keepsake photo
                      </h4>
                      <p className="text-[11px] text-espresso-400 mt-0.5">
                        Clear, well-lit portraits, pets, couple or family photos. You&apos;ll see your cute 3D design before ordering.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="btn-primary py-2 px-6 text-xs font-bold uppercase tracking-wider shadow-xs"
                    >
                      Choose Photo
                    </button>
                  </div>
                ) : (
                  /* The customer's 3D design */
                  <div className="p-4 rounded-2xl bg-cream-50/60 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="truncate">Photo: {fileName || "your photo"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={preview.busy}
                        className="text-xs font-bold text-ribbon-600 hover:underline cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        Change Photo
                      </button>
                    </div>

                    <KeepsakeDesignPreview preview={preview} />

                    {preview.status === "ready" && (
                      <button
                        type="button"
                        onClick={() => setZoomImage({ src: assetUrl(preview.approvedPreview), title: "Your 3D Keepsake Design" })}
                        className="w-full text-center text-[11px] font-semibold text-espresso-500 hover:text-burgundy-900 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={13} />
                        <span>View design full screen</span>
                      </button>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* STEP 2: Choose Size */}
              <div className="space-y-3 pt-4 border-t border-rose-50">
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                  2. Choose Keepsake Size *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SIZES.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <div
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-center relative ${
                          isSelected
                            ? "border-burgundy-900 bg-rose-50/60 shadow-xs ring-1 ring-burgundy-900/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        {size.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-burgundy-900 text-white whitespace-nowrap shadow-xs">
                            Most Loved
                          </span>
                        )}
                        <div>
                          <div className="font-display font-bold text-burgundy-900 text-base">
                            {size.name}
                          </div>
                          <div className="text-[11px] font-semibold text-ribbon-600 mt-0.5">
                            {size.dimensions}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <div className="font-bold text-slate-900 text-base font-mono">
                            {formatPrice(size.price)}
                          </div>
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatPrice(size.mrp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Inscription Text for THIS Keepsake */}
              <div className="space-y-3 pt-4 border-t border-rose-50">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                    3. Custom Inscription / Engraved Text
                  </label>
                  <span className="text-[11px] text-espresso-400">Optional</span>
                </div>

                <input
                  type="text"
                  value={inscriptionText}
                  onChange={(e) => setInscriptionText(e.target.value)}
                  placeholder="e.g. Kabir & Ananya • 14.02.2025 / Bruno 🐾 / Happy Birthday Mom"
                  className="input-field text-xs py-3"
                />
                <p className="text-[10px] text-espresso-400">
                  Each keepsake can have its own distinct text engraving or message.
                </p>
              </div>

              {/* STEP 4: Quantity & Action Buttons */}
              <div className="pt-4 border-t border-rose-50 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-slate-700 hover:bg-slate-200 font-bold transition text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2.5 text-xs font-bold text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2.5 text-slate-700 hover:bg-slate-200 font-bold transition text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Button 1: Add and configure another keepsake */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={!preview.canOrder || preview.busy}
                  className="w-full sm:w-auto flex-1 btn-secondary py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus size={15} />
                  <span>Add &amp; Customize Another</span>
                </button>

                {/* Button 2: Add and open bag / checkout */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={!preview.canOrder || preview.busy}
                  className="w-full sm:w-auto flex-1 btn-primary py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag size={15} />
                  <span>Add to Bag ({formatPrice((selectedSize?.price || 1299) * quantity)})</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Keepsakes in this Order Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24 rounded-3xl bg-white border border-rose-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-rose-50 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-ribbon-500" />
                  <h3 className="font-display font-bold text-base text-burgundy-900">
                    Keepsakes in Your Order ({personalizedCartItems.length})
                  </h3>
                </div>
              </div>

              {personalizedCartItems.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-rose-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-rose-100 text-ribbon-500 flex items-center justify-center mx-auto">
                    <Sparkles size={18} />
                  </div>
                  <h4 className="font-bold text-xs text-burgundy-900">No keepsakes added yet</h4>
                  <p className="text-[11px] text-espresso-400 max-w-xs mx-auto">
                    Upload your first photo on the left, pick size &amp; text, and click &ldquo;Add to Bag&rdquo;.
                  </p>
                </div>
              ) : (
                /* List of All Configured Keepsakes */
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {personalizedCartItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-cream-50/50 border border-rose-100 hover:border-rose-200 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={assetUrl(item.image)}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover border border-rose-100 bg-white shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-burgundy-900 truncate">
                            Keepsake #{idx + 1}: {item.customization?.size || "Custom 3D"}
                          </div>
                          <div className="text-[11px] text-espresso-500 font-mono mt-0.5">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </div>
                          {item.customization?.customName && (
                            <div className="text-[10px] text-ribbon-700 italic truncate mt-0.5 max-w-[170px]">
                              &ldquo;{item.customization.customName}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-mono font-bold text-burgundy-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Remove this keepsake"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary & Checkout CTA */}
              {personalizedCartItems.length > 0 && (
                <div className="pt-4 border-t border-rose-100 space-y-3">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-espresso-500">Total Personalized Items</span>
                    <span className="font-mono font-bold text-burgundy-900 text-sm">
                      {formatPrice(
                        personalizedCartItems.reduce((acc, i) => acc + i.price * i.quantity, 0)
                      )}
                    </span>
                  </div>

                  <Link
                    to="/checkout"
                    className="btn-primary w-full py-3.5 text-xs font-bold uppercase tracking-wider justify-center flex items-center gap-2 shadow-md hover:shadow-lg transition"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={15} />
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full text-center text-xs font-semibold text-ribbon-600 hover:underline cursor-pointer py-1"
                  >
                    + Add another keepsake to this order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay Lightbox */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 cursor-pointer select-none overflow-hidden"
          >
            <div className="absolute top-5 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
              <span className="text-white/90 text-sm sm:text-base font-display font-bold tracking-wide uppercase">
                {zoomImage.title}
              </span>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="pointer-events-auto p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all hover:scale-110 cursor-pointer shadow-lg"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[95vw] flex items-center justify-center"
            >
              <img
                src={zoomImage.src}
                alt={zoomImage.title}
                className="max-h-[88vh] max-w-[92vw] object-contain shadow-2xl transition-transform"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
