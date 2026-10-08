import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Check,
  Sparkles,
  CheckCircle2,
  Calendar,
  Type,
  Layers,
  Award,
  Truck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { api, assetUrl } from "../api/client";
import toast from "react-hot-toast";

const SIZE_TIERS = [
  {
    id: "mini",
    name: "Mini Keepsake (3.5\" / 9 cm)",
    price: 699,
    mrp: 1299,
    badge: "Compact",
  },
  {
    id: "classic",
    name: "Classic Studio (5.5\" / 14 cm)",
    price: 1299,
    mrp: 2199,
    badge: "Popular",
    popular: true,
  },
  {
    id: "grand",
    name: "Grand Collector Deluxe (8.0\" / 20 cm)",
    price: 2199,
    mrp: 3699,
    badge: "Luxury",
  },
];

const SAMPLE_PRESETS = [
  {
    id: "dog",
    name: "Bruno (Dog)",
    url: "/src/assets/images/3d-dog-keepsake.jpeg",
    text: "Bruno 🐾",
    date: "12.08.2026",
    note: "Forever in our hearts",
  },
  {
    id: "couple",
    name: "Couple Milestone",
    url: "/src/assets/images/3d-couple-keepsake.jpeg",
    text: "Ananya & Kabir",
    date: "14.02.2025",
    note: "Our Story Begins Here",
  },
  {
    id: "cat",
    name: "Milo (Cat)",
    url: "/src/assets/images/3d-cat-keepsake.jpeg",
    text: "Milo 🐱",
    date: "05.04.2026",
    note: "The Purrfect Keepsake",
  },
  {
    id: "family",
    name: "Family Keepsake",
    url: "/src/assets/images/3d-family-keepsake.jpeg",
    text: "Verma Family",
    date: "25.12.2025",
    note: "Home is family",
  },
];

export default function ProductCustomizerModal({ product, isOpen, onClose }) {
  const { addItem, openCart } = useCartStore();
  const fileInputRef = useRef(null);

  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [modelPreview, setModelPreview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(SIZE_TIERS[1]); // Default to Classic
  const [petName, setPetName] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [previewMode, setPreviewMode] = useState("3d");

  useEffect(() => {
    if (product) {
      setPetName(product.name.includes("Pet") ? "Bruno 🐾" : "Ananya & Kabir");
      setDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }));
      setNote("Made with love");
      const defaultImg = product.images?.[0] || SAMPLE_PRESETS[0].url;
      setUploadedPhoto(defaultImg);
      setModelPreview(defaultImg);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately with customer's actual uploaded photo
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPhoto(reader.result);
      setModelPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload & trigger 3D reference agent
    const form = new FormData();
    form.append("photo", file);
    setUploading(true);
    setIsGenerating(true);
    try {
      const { data } = await api.post("/3d-agent/generate", form);
      if (data.success && data.session?.views?.front?.url) {
        setUploadedPhoto(assetUrl(data.session.originalImage?.url));
        setModelPreview(assetUrl(data.session.views.front.url));
        toast.success("3D Model Generated from your photo!");
      } else {
        const { data: uploadData } = await api.post("/upload", form);
        if (uploadData?.url) setUploadedPhoto(uploadData.url);
      }
    } catch {
      // Keep local preview
    } finally {
      setUploading(false);
      setIsGenerating(false);
      setPreviewMode("3d");
    }
  };

  const selectPreset = (preset) => {
    setUploadedPhoto(preset.url);
    setModelPreview(preset.url);
    setPetName(preset.text);
    setDate(preset.date);
    setNote(preset.note);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const unitPrice = selectedSize ? selectedSize.price : product.price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addItem({
      productId: `${product._id || product.slug}-${selectedSize.id}`,
      name: `${product.name} (${selectedSize.name.split("(")[0].trim()})`,
      image: modelPreview || uploadedPhoto || product.images?.[0],
      price: unitPrice,
      sizeId: selectedSize.id,
      quantity,
      selectedOptions: [
        { name: "Size", value: selectedSize.name, priceDelta: 0 },
      ],
      customization: {
        photoUrl: uploadedPhoto || product.images?.[0],
        modelPreview: modelPreview || uploadedPhoto,
        size: selectedSize.name,
        customName: petName.trim(),
        customDate: date.trim(),
        note: note.trim(),
      },
    });
    toast.success(`${product.name} added to cart!`);
    onClose();
    openCart();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 lg:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col max-h-[92vh] my-auto"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-ribbon-500" />
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
                3D Keepsake Customizer &amp; Live Model Generator
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
            {/* Left: 3D Model Canvas */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 relative">
              {/* Mode Toggle */}
              <div className="mb-3 flex items-center bg-white border border-slate-200 p-1 rounded-xl gap-1 shadow-2xs">
                <button
                  onClick={() => setPreviewMode("3d")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    previewMode === "3d" ? "bg-ribbon-500 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🎨 3D Model
                </button>
                <button
                  onClick={() => setPreviewMode("original")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    previewMode === "original" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📷 Photo
                </button>
              </div>

              {/* Keepsake Visual Card */}
              <div className="relative w-56 sm:w-64 aspect-square rounded-2xl overflow-hidden bg-white shadow-xl border-2 border-slate-200 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center p-4 space-y-2">
                    <Sparkles className="animate-spin text-ribbon-500 mx-auto" size={28} />
                    <p className="text-xs font-bold text-slate-800">Generating 3D Miniature...</p>
                  </div>
                ) : (
                  <img
                    src={previewMode === "3d" ? assetUrl(modelPreview) : assetUrl(uploadedPhoto)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Bottom Inscription Overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-center">
                  <p className="text-xs font-bold truncate">{petName || "Custom Keepsake"}</p>
                  {date && <p className="text-[10px] text-slate-300">{date}</p>}
                </div>
              </div>

              {/* Presets */}
              <div className="mt-4 w-full max-w-xs">
                <p className="text-[10px] text-center uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Try sample 3D presets
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPreset(p)}
                      className="rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-ribbon-500 transition"
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Size Selection & Details */}
            <div className="lg:col-span-7 p-5 sm:p-7 space-y-4 bg-white">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">{product.name}</h3>
                <p className="text-xs text-slate-500">Handcrafted bespoke 3D keepsake with custom engraving</p>
              </div>

              {/* 1. Upload Photo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  1. Upload Your Photo
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-ribbon-500 bg-rose-50/40 text-slate-900 flex items-center justify-center gap-2 transition text-xs font-semibold"
                >
                  <Upload size={15} className="text-ribbon-500" />
                  <span>{uploading ? "Generating 3D preview..." : "Upload Photo for 3D Model"}</span>
                </button>
              </div>

              {/* 2. Select from 3 Sizes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                  2. Select Keepsake Size
                </label>
                <div className="space-y-2">
                  {SIZE_TIERS.map((tier) => {
                    const isSelected = selectedSize.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedSize(tier)}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-ribbon-500 bg-rose-50/50 shadow-xs"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-ribbon-500 bg-ribbon-500" : "border-slate-300"}`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-xs font-bold text-slate-900">{tier.name}</span>
                          {tier.popular && (
                            <span className="text-[9px] bg-ribbon-500 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 font-display">₹{tier.price}</span>
                          <span className="text-[10px] text-slate-400 line-through ml-1">₹{tier.mrp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Inscription */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Names / Engraved Text
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Kabir & Ananya"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="14.02.2025"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="btn-primary w-full py-3.5 text-xs sm:text-sm shadow-soft font-bold uppercase tracking-wider"
                >
                  <span>Add Customized 3D Keepsake — ₹{totalPrice.toLocaleString("en-IN")}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
