import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { assetUrl } from "../api/client";
import { useKeepsakePreview } from "../hooks/useKeepsakePreview";
import KeepsakeDesignPreview from "./KeepsakeDesignPreview";
import DesignNoteField from "./DesignNoteField";
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
    url: "/images/3d-dog-keepsake.webp",
    text: "Bruno 🐾",
    date: "12.08.2026",
    note: "Forever in our hearts",
  },
  {
    id: "couple",
    name: "Couple Milestone",
    url: "/images/3d-couple-keepsake.webp",
    text: "Ananya & Kabir",
    date: "14.02.2025",
    note: "Our Story Begins Here",
  },
  {
    id: "cat",
    name: "Milo (Cat)",
    url: "/images/3d-cat-keepsake.webp",
    text: "Milo 🐱",
    date: "05.04.2026",
    note: "The Purrfect Keepsake",
  },
  {
    id: "family",
    name: "Family Keepsake",
    url: "/images/3d-family-keepsake.webp",
    text: "Verma Family",
    date: "25.12.2025",
    note: "Home is family",
  },
];

export default function ProductCustomizerModal({ product, isOpen, onClose }) {
  const { addItem, openCart } = useCartStore();
  const fileInputRef = useRef(null);

  const preview = useKeepsakePreview();
  const resetPreview = preview.reset;
  const [sample, setSample] = useState(SAMPLE_PRESETS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_TIERS[1]); // Default to Classic
  const [petName, setPetName] = useState("");
  const [date, setDate] = useState("");
  const [quantity] = useState(1);

  // Fresh start each time: the inscription is printed, so never pre-fill it
  useEffect(() => {
    if (product) {
      setPetName("");
      setDate("");
      setSample(product.images?.[0] ? { url: product.images[0], text: product.name, date: "" } : SAMPLE_PRESETS[0]);
      resetPreview();
    }
  }, [product, isOpen, resetPreview]);

  if (!isOpen || !product) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    preview.upload(file);
  };

  const selectPreset = (preset) => setSample(preset);

  const unitPrice = selectedSize ? selectedSize.price : product.price;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const design = preview.cartFields();
    if (!design) {
      toast.error("Upload your photo to create your 3D design first");
      return;
    }
    addItem({
      productId: `${product._id || product.slug}-${selectedSize.id}`,
      name: `${product.name} (${selectedSize.name.split("(")[0].trim()})`,
      image: design.image,
      price: unitPrice,
      sizeId: selectedSize.id,
      quantity,
      selectedOptions: [
        { name: "Size", value: selectedSize.name, priceDelta: 0 },
      ],
      customization: {
        ...design.customization,
        size: selectedSize.name,
        customName: petName.trim(),
        customDate: date.trim(),
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
                Design Your 3D Keepsake
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
              {preview.status !== "idle" ? (
                <KeepsakeDesignPreview preview={preview} className="w-full" />
              ) : (
                /* Example keepsake until the customer uploads their own photo */
                <div className="relative w-56 sm:w-64 aspect-square rounded-2xl overflow-hidden bg-white shadow-xl border-2 border-slate-200 flex items-center justify-center">
                  <img src={assetUrl(sample.url)} alt="Example keepsake" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Example
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-2 rounded-xl text-center">
                    <p className="text-xs font-bold truncate">{sample.text}</p>
                    {sample.date && <p className="text-[10px] text-slate-300">{sample.date}</p>}
                  </div>
                </div>
              )}

              {/* Presets */}
              {preview.status === "idle" && (
              <div className="mt-4 w-full max-w-xs">
                <p className="text-[10px] text-center uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Example 3D keepsakes
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
              )}
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
                  disabled={preview.busy}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-ribbon-500 bg-rose-50/40 text-slate-900 flex items-center justify-center gap-2 transition text-xs font-semibold"
                >
                  <Upload size={15} className="text-ribbon-500" />
                  <span>
                    {preview.status === "generating"
                      ? "Creating your 3D design..."
                      : preview.status === "idle"
                        ? "Upload Photo for Your 3D Design"
                        : "Upload a Different Photo"}
                  </span>
                </button>
                <p className="mt-1 text-[10px] text-slate-500">
                  A clear, well-lit photo with faces visible works best. We&apos;ll show you the 3D design before you order.
                </p>
              </div>

              <DesignNoteField preview={preview} />

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
                  disabled={!preview.canOrder || preview.busy}
                  className="btn-primary w-full py-3.5 text-xs sm:text-sm shadow-soft font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Add Customized 3D Keepsake — ₹{totalPrice.toLocaleString("en-IN")}</span>
                  <ArrowRight size={15} />
                </button>
                {!preview.canOrder && !preview.busy && (
                  <p className="mt-1.5 text-center text-[10px] text-slate-500">Upload your photo to see your 3D design, then add it to your cart.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
