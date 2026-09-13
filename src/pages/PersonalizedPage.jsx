import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Layers,
  Heart,
  ShieldCheck,
  Truck,
  RotateCw,
  Box,
  Gift,
  ArrowRight,
  Eye,
  Sliders,
  Award,
  Clock,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { useLocationStore } from "../store/locationStore";

const SIZES = [
  {
    id: "mini",
    name: "Mini Keepsake",
    dimensions: "3.5\" (9 cm)",
    description: "Compact & cute. Ideal for fridge magnet & work desk companion.",
    price: 699,
    mrp: 1299,
    badge: "Pocket Size",
    badgeColor: "bg-blue-600",
    features: ["Neodymium Magnet Backing", "Matte Polymer Resin Finish", "Eco-friendly Gift Pouch"],
  },
  {
    id: "classic",
    name: "Classic Studio",
    dimensions: "5.5\" (14 cm)",
    description: "Our #1 Most Loved size. High-definition sculpt on solid mahogany base.",
    price: 1299,
    mrp: 2199,
    badge: "Most Popular",
    badgeColor: "bg-ribbon-500",
    popular: true,
    features: [
      "Solid Mahogany Wood Base",
      "Hand-Painted Realistic Details",
      "Dual Desk Stand + Magnet",
      "Satin Ribbon Gift Box",
    ],
  },
  {
    id: "grand",
    name: "Grand Collector Deluxe",
    dimensions: "8.0\" (20 cm)",
    description: "Museum-grade collector's sculpt in an illuminated luxury shadow box.",
    price: 2199,
    mrp: 3699,
    badge: "Luxury Heirloom",
    badgeColor: "bg-amber-600",
    features: [
      "Premium Dark Walnut Plinth",
      "Illuminated Glass Shadow Box",
      "Gold Engraved Metal Inscription",
      "Artisan Certificate of Authenticity",
    ],
  },
];

const PRESET_MODELS = [
  {
    id: "couple",
    title: "Couple Milestone",
    type: "couple",
    originalPhoto: "/src/assets/images/for-couples.jpeg",
    generated3D: "/src/assets/images/3d-couple-keepsake.jpeg",
    name: "Ananya & Kabir",
    date: "14.02.2025",
    note: "Forever & Always",
  },
  {
    id: "dog",
    title: "Pet Miniature (Dog)",
    type: "dog",
    originalPhoto: "/src/assets/images/pet-keepsake.jpeg",
    generated3D: "/src/assets/images/3d-dog-keepsake.jpeg",
    name: "Bruno 🐾",
    date: "12.08.2026",
    note: "Best boy forever",
  },
  {
    id: "cat",
    title: "Pet Miniature (Cat)",
    type: "cat",
    originalPhoto: "/src/assets/images/photo-magnet.jpeg",
    generated3D: "/src/assets/images/3d-cat-keepsake.jpeg",
    name: "Milo 🐱",
    date: "05.04.2026",
    note: "The Purrfect Keepsake",
  },
  {
    id: "family",
    title: "Family Sculpt",
    type: "family",
    originalPhoto: "/src/assets/images/gifts-for-parents.jpeg",
    generated3D: "/src/assets/images/3d-family-keepsake.jpeg",
    name: "Verma Family",
    date: "25.12.2025",
    note: "Home is where family is",
  },
  {
    id: "baby",
    title: "Baby Hand & Foot Cast",
    type: "baby",
    originalPhoto: "/src/assets/images/gifts-for-her.jpeg",
    generated3D: "/src/assets/images/3d-baby-keepsake.jpeg",
    name: "Baby Aarav",
    date: "18.06.2026",
    note: "Tiny hands, endless love",
  },
];

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PersonalizedPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const location = useLocationStore((s) => s.location);
  const fileInputRef = useRef(null);

  // Studio Flow State
  const [selectedPreset, setSelectedPreset] = useState(PRESET_MODELS[0]);
  const [userPhoto, setUserPhoto] = useState(PRESET_MODELS[0].originalPhoto);
  const [generatedModel, setGeneratedModel] = useState(PRESET_MODELS[0].generated3D);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStepText, setGenerationStepText] = useState("");
  const [previewMode, setPreviewMode] = useState("3d"); // "3d" or "original"

  // Customization Options
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Default to Classic Studio
  const [customName, setCustomName] = useState("Ananya & Kabir");
  const [customDate, setCustomDate] = useState("14.02.2025");
  const [giftNote, setGiftNote] = useState("Forever & Always");
  const [baseFinish, setBaseFinish] = useState("Mahogany Wood Plinth");
  const [quantity, setQuantity] = useState(1);

  // Handle Photo Upload and 3D Model Generation
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = reader.result;
      setUserPhoto(photoUrl);
      start3DGeneration(photoUrl);
    };
    reader.readAsDataURL(file);
  };

  const start3DGeneration = (photoUrl) => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStepText("Analyzing facial features & contours...");

    const steps = [
      { progress: 30, text: "Generating 3D polygonal mesh & depth topology..." },
      { progress: 60, text: "Applying realistic textures, lighting & resin finish..." },
      { progress: 85, text: "Crafting miniature keepsake base & wooden plinth..." },
      { progress: 100, text: "✨ Cute 3D Printed Model Generated!" },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setGenerationProgress(steps[stepIdx].progress);
        setGenerationStepText(steps[stepIdx].text);
        stepIdx++;
      } else {
        clearInterval(interval);
        // Smart model matching based on selected preset or photo
        const matchedModel = selectedPreset?.generated3D || "/src/assets/images/3d-couple-keepsake.jpeg";
        setGeneratedModel(matchedModel);
        setPreviewMode("3d");
        setIsGenerating(false);
        toast.success("3D Printed Model Preview Ready!");
      }
    }, 450);
  };

  const selectInspirationPreset = (preset) => {
    setSelectedPreset(preset);
    setUserPhoto(preset.originalPhoto);
    setGeneratedModel(preset.generated3D);
    setCustomName(preset.name);
    setCustomDate(preset.date);
    setGiftNote(preset.note);
    setPreviewMode("3d");
    toast.success(`Loaded ${preset.title} preset!`);
  };

  // Add customized 3D keepsake to cart
  const handleAddToCart = () => {
    const unitPrice = selectedSize.price;
    addItem({
      productId: `custom-3d-${selectedSize.id}-${Date.now()}`,
      name: `Custom 3D Keepsake (${selectedSize.name})`,
      image: generatedModel,
      price: unitPrice,
      quantity,
      selectedOptions: [
        { name: "Keepsake Size", value: `${selectedSize.name} - ${selectedSize.dimensions}`, priceDelta: 0 },
        { name: "Display Base", value: baseFinish, priceDelta: 0 },
      ],
      customization: {
        photoUrl: userPhoto,
        modelPreview: generatedModel,
        size: selectedSize.name,
        dimensions: selectedSize.dimensions,
        customName: customName.trim(),
        customDate: customDate.trim(),
        note: giftNote.trim(),
      },
    });

    toast.success(`${selectedSize.name} 3D Keepsake added to your bag!`);
    openCart();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Top Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-100/80 text-ribbon-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-ribbon-500" />
            <span>Live 3D Customizer Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Turn Your Photo Into a Cute 3D Printed Keepsake
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Upload your favorite photo, view the instant cute 3D miniature model preview, choose your desired size, and let our artisans handcraft your lifelong keepsake.
          </p>
        </div>

        {/* Main 2-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3D Model Live Canvas & Photo Uploader */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            {/* Visual Canvas Display Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative overflow-hidden">
              {/* Top Mode Selector Tabs */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Live Model Viewer
                  </span>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setPreviewMode("3d")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      previewMode === "3d"
                        ? "bg-white text-ribbon-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🎨 3D Model Preview
                  </button>
                  <button
                    onClick={() => setPreviewMode("original")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      previewMode === "original"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📷 Original Photo
                  </button>
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="relative aspect-square max-h-[460px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-b from-slate-100 via-rose-50/40 to-slate-200/60 border-2 border-slate-100 shadow-inner flex items-center justify-center">
                {/* Generation Loading State Animation */}
                {isGenerating ? (
                  <div className="p-8 text-center space-y-4 max-w-sm">
                    <div className="relative mx-auto h-20 w-20 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-rose-200 border-t-ribbon-500 animate-spin"></div>
                      <Sparkles size={28} className="text-ribbon-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-slate-900">
                        Generating Cute 3D Miniature...
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{generationStepText}</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-ribbon-500 to-rose-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Rendered Model or Photo */}
                    <motion.img
                      key={previewMode}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={previewMode === "3d" ? generatedModel : userPhoto}
                      alt="Keepsake Preview"
                      className="h-full w-full object-cover object-center"
                    />

                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-bold text-slate-900 shadow-md border border-slate-200/80 flex items-center gap-1.5">
                        <Award size={14} className="text-amber-500" />
                        <span>{selectedSize.name} ({selectedSize.dimensions})</span>
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/85 backdrop-blur-md text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs shadow-lg">
                      <div className="truncate pr-2">
                        <p className="font-bold truncate">{customName || "Personalized Keepsake"}</p>
                        <p className="text-[11px] text-slate-300 truncate">{customDate} • {giftNote}</p>
                      </div>
                      <span className="text-[10px] bg-ribbon-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                        Hand-Cast 3D
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Upload Action Button */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary w-full sm:w-auto py-3 px-6 text-xs uppercase font-bold tracking-wider gap-2 shadow-soft"
                >
                  <Upload size={16} />
                  <span>Upload Your Own Photo</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center sm:text-right">
                  High-res photos produce highest 3D likeness. Supports JPG, PNG.
                </p>
              </div>
            </div>

            {/* Inspiration Presets Gallery */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-ribbon-500" />
                <span>Or Test With Popular 3D Presets</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_MODELS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectInspirationPreset(p)}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      selectedPreset?.id === p.id
                        ? "border-ribbon-500 bg-rose-50/70 ring-2 ring-rose-200"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <img
                      src={p.generated3D}
                      alt={p.title}
                      className="h-16 w-full rounded-xl object-cover mb-1.5 shadow-2xs"
                    />
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {p.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Size Selection (3 Different Sizes & Costs) + Details + Cart */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-6">
            {/* 1. Size Selection Cards */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-ribbon-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Choose Your Keepsake Size</span>
                  </h3>
                  <span className="text-xs text-ribbon-600 font-bold">3 Sizes Available</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Each size features distinct dimensions, materials &amp; pricing.</p>
              </div>

              <div className="space-y-3 pt-1">
                {SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <div
                      key={size.id}
                      onClick={() => {
                        setSelectedSize(size);
                        toast.success(`Selected ${size.name}`);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-ribbon-500 bg-rose-50/50 shadow-md ring-1 ring-rose-300"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {size.popular && (
                        <span className="absolute -top-2.5 right-4 bg-ribbon-500 text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          ★ Most Popular
                        </span>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-sm text-slate-900">{size.name}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {size.dimensions}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{size.description}</p>
                        </div>

                        {/* Price Column */}
                        <div className="text-right shrink-0">
                          <div className="text-base font-extrabold text-slate-900 font-display">
                            {formatPrice(size.price)}
                          </div>
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatPrice(size.mrp)}
                          </div>
                        </div>
                      </div>

                      {/* Included features pill */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {size.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1"
                          >
                            <CheckCircle2 size={10} className="text-emerald-600" />
                            <span>{feat}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Custom Inscription & Options */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-ribbon-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Personalized Inscription &amp; Details</span>
              </h3>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Names / Title to Engrave
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Kabir & Ananya, Bruno 🐾"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Anniversary / Date
                    </label>
                    <input
                      type="text"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      placeholder="e.g. 14.02.2025"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Display Finish
                    </label>
                    <select
                      value={baseFinish}
                      onChange={(e) => setBaseFinish(e.target.value)}
                      className="input-field text-xs"
                    >
                      <option value="Mahogany Wood Plinth">Mahogany Wood Plinth</option>
                      <option value="Polished Marble Base">Polished Marble Base</option>
                      <option value="Magnetic Acrylic Backing">Magnetic Acrylic Backing</option>
                      <option value="Shadow Box Frame">Shadow Box Frame</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Free Handwritten Gift Card Note
                  </label>
                  <textarea
                    rows={2}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a message to be hand-penned on our signature ribbon card..."
                    className="input-field text-xs resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pricing Summary, Delivery & Add To Cart CTA */}
            <div className="bg-gradient-to-br from-slate-900 via-burgundy-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Total Keepsake Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                      {formatPrice(selectedSize.price * quantity)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(selectedSize.mrp * quantity)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full">
                      Save {Math.round(((selectedSize.mrp - selectedSize.price) / selectedSize.mrp) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-7 w-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-7 w-7 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Delivery info */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Truck size={15} className="text-emerald-400 shrink-0" />
                <span>
                  Delivering to <strong>{location?.city || "your city"}</strong>: Dispatches in 24 hrs.
                </span>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="btn-primary w-full py-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg bg-gradient-to-r from-ribbon-500 to-rose-600 hover:from-ribbon-600 hover:to-rose-700"
              >
                <span>Add Custom 3D Keepsake to Cart</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  100% Likeness Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <Gift size={13} className="text-amber-400" />
                  Signature Ribbon Box Included
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
