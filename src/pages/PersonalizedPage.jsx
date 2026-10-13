import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  ShoppingBag,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { assetUrl } from "../api/client";
import { useSeo } from "../utils/seo";
import { useKeepsakePreview } from "../hooks/useKeepsakePreview";

const SIZES = [
  {
    id: "small",
    name: "Small",
    dimensions: '3.5" (9 cm)',
    price: 699,
    mrp: 1299,
    desc: "Desk & compact display",
  },
  {
    id: "medium",
    name: "Medium",
    dimensions: '5.5" (14 cm)',
    price: 1299,
    mrp: 2199,
    popular: true,
    desc: "Most loved • Living room & gifts",
  },
  {
    id: "large",
    name: "Large",
    dimensions: '8.0" (20 cm)',
    price: 2199,
    mrp: 3699,
    desc: "Collector edition • High detail",
  },
];

const MESSAGE_SUGGESTIONS = [
  "Forever & Always ❤️",
  "Best Friends 🐾",
  "Happy Anniversary 🥂",
  "Our Little Wonder ✨",
  "Family First 👨‍👩‍👧",
  "You & Me Always 💖",
];

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PersonalizedPage() {
  useSeo({
    title: "Create a Personalised 3D Keepsake | The Ribbon Story",
    description: "Upload a photo, preview your cute 3D figurine in seconds, choose size and engraving to create a handcrafted keepsake.",
  });

  const { addItem, openCart } = useCartStore();
  const fileInputRef = useRef(null);

  // Active Keepsake Builder State
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [inscriptionText, setInscriptionText] = useState("");
  const [artisanNote, setArtisanNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Photo -> 3D design preview
  const preview = useKeepsakePreview();
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const hasPhoto = Boolean(localPhotoUrl || preview.originalUrl);
  const hasPreview =
    preview.status === "generating" ||
    preview.status === "ready" ||
    preview.status === "error" ||
    preview.status === "unavailable" ||
    preview.regenerating;

  // Lock body scroll and listen for Escape key when fullscreen lightbox is active
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

  // Photo selected: save file and show preview on left without immediately generating
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setLocalPhotoUrl(objUrl);
    if (preview.status !== "idle") {
      preview.reset();
    }
  };

  // Helper to construct combined prompt notes incorporating engraved base text AND studio artisan notes
  const buildPromptNotes = () => {
    const parts = [];
    const baseText = inscriptionText.trim();
    const noteText = artisanNote.trim();

    if (baseText) {
      parts.push(`- Engraved Base Text: "${baseText}" (cleanly sculpt, engrave, or emboss this exact text onto the front surface of the figurine's display base platform)`);
    }
    if (noteText) {
      parts.push(`- Studio Artisan Notes: "${noteText}" (incorporate these specific custom details into the 3D figurine sculpt and colors)`);
    }

    return parts.join("\n");
  };

  // Generate 3D figurine incorporating user's size, base engraving, and artisan notes
  const handleGeneratePreview = () => {
    if (!hasPhoto || preview.busy) return;

    const promptNotes = buildPromptNotes();
    const extraData = {
      engravingText: inscriptionText.trim(),
      artisanNotes: artisanNote.trim(),
    };

    if (selectedFile) {
      preview.upload(selectedFile, promptNotes, extraData);
    } else if (preview.originalUrl) {
      preview.regenerate(promptNotes, extraData);
    }
  };

  // Regenerate with updated notes
  const handleRegenerateVariation = () => {
    const promptNotes = buildPromptNotes();
    const extraData = {
      engravingText: inscriptionText.trim(),
      artisanNotes: artisanNote.trim(),
    };
    preview.regenerate(promptNotes, extraData);
  };

  // Reset form for next personalized keepsake
  const handleResetForm = () => {
    preview.reset();
    if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
    setSelectedFile(null);
    setLocalPhotoUrl(null);
    setInscriptionText("");
    setArtisanNote("");
    setQuantity(1);
    setSelectedSize(SIZES[1]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add customized 3D keepsake to cart and clear form
  const handleAddToCart = () => {
    const design = preview.cartFields();
    if (!design) {
      toast.error("Please upload a photograph and wait for your 3D preview");
      return;
    }

    const currentSize = selectedSize || SIZES[1];
    const unitPrice = currentSize.price;
    const uniqueId = `custom-3d-${currentSize.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const combinedNotes = [
      inscriptionText.trim() ? `[Base Engraving: ${inscriptionText.trim()}]` : "",
      artisanNote.trim() ? `[Note: ${artisanNote.trim()}]` : "",
      preview.note?.trim() ? `[AI Note: ${preview.note.trim()}]` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const cuteImage = design.customization?.cuteImageUrl || design.image;
    const originalPhoto = design.customization?.photoUrl || preview.originalUrl || localPhotoUrl;

    addItem({
      productId: uniqueId,
      name: `Custom 3D Keepsake (${currentSize.name} - ${currentSize.dimensions})`,
      image: cuteImage,
      price: unitPrice,
      sizeId: currentSize.id,
      quantity,
      selectedOptions: [
        { name: "Keepsake Size", value: `${currentSize.name} (${currentSize.dimensions})`, priceDelta: 0 },
      ],
      customization: {
        ...design.customization,
        cuteImageUrl: cuteImage,
        reference3D: { approvedPreview: cuteImage },
        photoUrl: originalPhoto,
        size: currentSize.name,
        dimensions: currentSize.dimensions,
        customName: inscriptionText.trim(),
        note: combinedNotes || undefined,
      },
    });

    toast.success(`Added ${currentSize.name} keepsake to your bag!`);

    // Clear form and open cart
    handleResetForm();
    openCart();
  };

  const displayOriginal = localPhotoUrl || preview.localPhoto || (preview.originalUrl ? assetUrl(preview.originalUrl) : null);
  const displayCute = preview.approvedPreview ? assetUrl(preview.approvedPreview) : null;

  return (
    <div className="bg-[#FAF7F5] min-h-screen pt-2 sm:pt-4 pb-8 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Header - Compact */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-2xl font-display font-bold text-burgundy-900 tracking-tight">
            Personalize Your 3D Keepsake
          </h1>
        </div>

        {/* Main Two-Card Row (Uploaded Photo / Dropzone on Left, Preview or Size Pricing on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mb-6">
          {/* LEFT CARD: Customer Photo Upload or Render */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 flex flex-col justify-center items-center min-h-[440px] relative">
            {!hasPhoto ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-rose-200 hover:border-ribbon-500 bg-rose-50/20 hover:bg-rose-50/50 rounded-2xl text-center space-y-4 transition-all cursor-pointer group shadow-2xs min-h-[380px]"
              >
                <div className="h-16 w-16 rounded-2xl bg-rose-100 text-ribbon-600 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-xs">
                  <Upload size={28} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-burgundy-900">
                    Choose Your Photo
                  </h3>
                  <p className="text-xs text-espresso-400 mt-1 max-w-xs mx-auto">
                    Portraits, couple memories, pets, or family photos.
                  </p>
                </div>

                {/* Photo Guide Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-[10px] font-semibold text-espresso-600">
                    🐾 Pets
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-[10px] font-semibold text-espresso-600">
                    💑 Couples
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-[10px] font-semibold text-espresso-600">
                    👶 Babies
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-rose-200 text-[10px] font-semibold text-espresso-600">
                    👨‍👩‍👧 Family
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-primary py-2.5 px-8 text-xs font-bold uppercase tracking-wider shadow-sm mt-1"
                >
                  Select Photo
                </button>
              </div>
            ) : (
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-white to-rose-50/40 border border-rose-100 shadow-sm flex items-center justify-center group">
                <img
                  src={displayOriginal}
                  alt=""
                  className="w-full h-full object-contain p-1"
                />
                {/* Hover Overlay directly on the image */}
                <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={preview.busy}
                    className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={14} />
                    <span>Change Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomImage({ src: displayOriginal, title: "Your Uploaded Photo" })}
                    className="py-1.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Zoom Fullscreen</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CARD: Size Pricing + Inscription & Notes (before generation) OR 3D Preview (during/after generation) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 flex flex-col justify-center items-center min-h-[440px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!hasPreview ? (
                /* STATE 1: Before Generation -> Configure Size, Engraving & Artisan Notes, then Click Generate */
                <motion.div
                  key="pricing-options-initial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex flex-col justify-center space-y-3.5"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-burgundy-900">
                          Configure Your 3D Keepsake
                        </h3>
                        <p className="text-[11px] text-espresso-400">
                          These details will be sculpted into your 3D figurine
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 font-mono">
                        3 Sizes
                      </span>
                    </div>

                    {/* Three Size Pricing Cards */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      {SIZES.map((size) => {
                        const isSelected = selectedSize?.id === size.id;
                        return (
                          <button
                            key={size.id}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-center relative ${
                              isSelected
                                ? "border-rose-500 bg-rose-50/90 shadow-sm ring-2 ring-rose-400/30 scale-[1.02]"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            {size.popular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-rose-500 text-white whitespace-nowrap shadow-2xs">
                                Loved
                              </span>
                            )}
                            <div>
                              <div className={`font-display font-bold text-sm ${isSelected ? "text-rose-900" : "text-burgundy-900"}`}>
                                {size.name}
                              </div>
                              <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                                {size.dimensions}
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 w-full">
                              <div className="font-bold text-slate-900 text-xs font-mono">
                                {formatPrice(size.price)}
                              </div>
                              <div className="text-[9px] text-slate-400 line-through">
                                {formatPrice(size.mrp)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Optional Message / Inscription with Suggestions */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                          Engraved Base Text
                        </label>
                        <span className="text-[10px] text-espresso-400 font-semibold">Optional</span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={inscriptionText}
                        onChange={(e) => setInscriptionText(e.target.value)}
                        placeholder="e.g. Forever & Always / Max 🐾"
                        className="input-field text-xs py-2"
                      />

                      {/* Clickable Suggestion Chips */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {MESSAGE_SUGGESTIONS.map((suggestion) => {
                          const isCurrent = inscriptionText === suggestion;
                          return (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setInscriptionText(isCurrent ? "" : suggestion)}
                              className={`px-2 py-0.5 rounded-full text-[10px] transition cursor-pointer font-medium border ${
                                isCurrent
                                  ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                  : "bg-rose-50/70 hover:bg-rose-100/80 text-rose-800 border-rose-200/80"
                              }`}
                            >
                              {suggestion}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Studio Artisan Notes */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900">
                          Studio Artisan Notes
                        </label>
                        <span className="text-[10px] text-espresso-400 font-semibold">Optional</span>
                      </div>
                      <input
                        type="text"
                        maxLength={150}
                        value={artisanNote}
                        onChange={(e) => setArtisanNote(e.target.value)}
                        placeholder="e.g. Highlight blue jacket, preserve pet collar, keep glasses"
                        className="input-field text-xs py-2"
                      />
                      <p className="text-[10px] text-espresso-400 leading-snug">
                        Custom details our 3D studio will incorporate into your figurine.
                      </p>
                    </div>

                    {/* Action Button: Generate 3D Preview (Disabled until image uploaded) */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleGeneratePreview}
                        disabled={!hasPhoto || preview.busy}
                        className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all duration-200 select-none ${
                          !hasPhoto
                            ? "bg-rose-100/60 text-rose-300 border border-rose-200/70 cursor-not-allowed shadow-none"
                            : preview.busy
                            ? "bg-rose-400 text-white cursor-wait opacity-85 shadow-md"
                            : "btn-primary shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        }`}
                      >
                        <Sparkles
                          size={16}
                          className={
                            hasPhoto && !preview.busy
                              ? "text-amber-300 animate-pulse"
                              : preview.busy
                              ? "animate-spin text-white"
                              : "text-rose-300"
                          }
                        />
                        <span>{preview.busy ? "Sculpting 3D Figurine…" : "✨ Generate 3D Preview"}</span>
                      </button>
                      {!hasPhoto && (
                        <p className="text-[10px] text-center text-rose-400 font-medium mt-1.5">
                          Upload your photo on the left card to enable 3D preview generation
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* STATE 2: Generating or Ready -> Show 3D Keepsake Preview / Magic Happening Animation */
                <motion.div
                  key="preview-active"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full flex flex-col justify-center items-center"
                >
                  {preview.status === "generating" || preview.regenerating ? (
                    /* PROCESSING ANIMATION - CLEAN LIGHT AESTHETIC, NO DARK BACKGROUND, NO AI/QWEN MENTIONS */
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-rose-50/50 border-2 border-rose-100 shadow-sm flex flex-col items-center justify-center p-6 text-center select-none">
                      {/* Subtle ambient pastel glow */}
                      <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-200/40 rounded-full blur-3xl animate-pulse" />
                      <div
                        className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-200/40 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                      />

                      {/* Spinning Ring Animation */}
                      <div className="relative mb-4">
                        <div
                          className="w-20 h-20 rounded-full border-2 border-dashed border-rose-400 animate-spin"
                          style={{ animationDuration: "10s" }}
                        />
                        <div
                          className="absolute inset-2 rounded-full border border-rose-200 animate-spin"
                          style={{ animationDuration: "6s", animationDirection: "reverse" }}
                        />
                        <div className="absolute inset-3.5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                            <Sparkles className="text-ribbon-500 animate-pulse" size={22} />
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 space-y-1.5 max-w-[260px]">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 border border-rose-200 text-[10px] font-bold text-ribbon-700 uppercase tracking-wider">
                          <Sparkles size={11} className="text-ribbon-500" />
                          <span>Crafting in Progress</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-burgundy-900 tracking-wide">
                          Sculpting 3D Figurine…
                        </h4>
                        <p className="text-xs text-espresso-500 leading-relaxed">
                          Analyzing contours and sculpting your personalized 3D keepsake figurine.
                        </p>
                      </div>

                      <div className="mt-3 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-[10px] text-rose-700 font-mono font-medium">
                        Takes ~10–20 seconds
                      </div>
                    </div>
                  ) : preview.status === "ready" && displayCute ? (
                    /* RENDERED 3D FIGURINE */
                    <div className="w-full space-y-3">
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-white to-rose-50/40 border-2 border-rose-200 shadow-md flex items-center justify-center group">
                        <img
                          src={displayCute}
                          alt="Cute 3D Keepsake Figurine"
                          className="w-full h-full object-contain p-2 hover:scale-105 transition duration-300 cursor-pointer"
                          onClick={() => setZoomImage({ src: displayCute, title: "Your Cute 3D Keepsake Figurine" })}
                        />
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                          <button
                            type="button"
                            onClick={() => setZoomImage({ src: displayCute, title: "Your Cute 3D Keepsake Figurine" })}
                            className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>Zoom</span>
                          </button>
                        </div>
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 shadow-xs pointer-events-none">
                          <Sparkles size={10} />
                          <span>3D Print Ready</span>
                        </span>
                      </div>

                      {/* Multiple Variations Strip */}
                      {preview.attempts?.length > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {preview.attempts.map((url, i) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => preview.select(i)}
                              className={`w-12 h-12 rounded-xl overflow-hidden border-2 bg-white transition p-0.5 cursor-pointer ${
                                i === preview.selected
                                  ? "border-ribbon-500 ring-2 ring-ribbon-500/30 scale-105"
                                  : "border-rose-100 hover:border-rose-300 opacity-70"
                              }`}
                            >
                              <img src={assetUrl(url)} alt="" className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Retry / Regenerate Variation */}
                      <button
                        type="button"
                        onClick={handleRegenerateVariation}
                        disabled={preview.busy || (preview.attemptsLeft ?? 0) <= 0}
                        className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-ribbon-600 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      >
                        <RefreshCw size={12} className={preview.regenerating ? "animate-spin" : ""} />
                        <span>
                          {(preview.attemptsLeft ?? 0) > 0
                            ? `Try Another Variation (${preview.attemptsLeft} left)`
                            : "Max variations reached"}
                        </span>
                      </button>
                    </div>
                  ) : (
                    /* Fallback: Reassuring luxury studio photo card when 3D preview is deferred or busy */
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-amber-50/30 border-2 border-rose-200/80 shadow-sm flex flex-col items-center justify-between p-5 text-center select-none">
                      {/* Ambient background glow */}
                      <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

                      {/* Top Reassurance Badge */}
                      <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10.5px] font-bold shadow-2xs">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Photo Saved • Studio Crafting Ready</span>
                      </div>

                      {/* Photo Thumbnail with Artisan Frame */}
                      {displayOriginal && (
                        <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-2 ring-rose-200/60 bg-rose-50 my-1 group">
                          <img
                            src={displayOriginal}
                            alt="Uploaded keepsake photo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Informative Text */}
                      <div className="relative z-10 space-y-1 max-w-xs">
                        <h4 className="font-display font-bold text-sm sm:text-base text-burgundy-900">
                          Handcrafted 3D Modeling
                        </h4>
                        <p className="text-[11px] sm:text-xs text-espresso-500 leading-relaxed">
                          Our 3D artisans will personally sculpt and calibrate your keepsake directly from your photograph during production. Select your size below to add to bag!
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-2 pt-1 w-full max-w-xs">
                        <button
                          type="button"
                          onClick={handleGeneratePreview}
                          disabled={preview.busy}
                          className="w-full flex-1 py-2 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-bold text-ribbon-600 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={12} className={preview.busy ? "animate-spin" : ""} />
                          <span>Retry 3D Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={preview.busy}
                          className="w-full flex-1 py-2 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-[11px] font-bold text-espresso-500 hover:text-burgundy-900 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <span>Change Photo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* LOWER SECTION: Seamlessly reveals below when preview is generated */}
        <AnimatePresence>
          {hasPreview && (
            <motion.div
              key="options-expanded-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-rose-100 space-y-3.5"
            >
              {/* SECTION 1: Keepsake Size & Pricing */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-rose-50 pb-2">
                  <div>
                    <h2 className="font-display font-bold text-base text-burgundy-900">
                      Choose Keepsake Size
                    </h2>
                    <p className="text-[11px] text-espresso-400 mt-0.5">
                      Select dimensions for your 3D printed keepsake figurine.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-ribbon-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    {selectedSize?.name} ({selectedSize?.dimensions})
                  </span>
                </div>

                {/* Size Cards - Compact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SIZES.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    return (
                      <div
                        key={size.id}
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-center relative ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/90 shadow-sm ring-2 ring-rose-400/30 scale-[1.01]"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        {size.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white whitespace-nowrap shadow-2xs">
                            Most Loved
                          </span>
                        )}
                        <div>
                          <div className={`font-display font-bold text-sm ${isSelected ? "text-rose-900" : "text-burgundy-900"}`}>
                            {size.name}
                          </div>
                          <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
                            {size.dimensions}
                          </div>
                          <p className="text-[10px] text-espresso-400 mt-0.5 leading-snug">
                            {size.desc}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-center gap-2">
                          <span className="font-bold text-slate-900 text-sm font-mono">
                            {formatPrice(size.price)}
                          </span>
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatPrice(size.mrp)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Single Inline Row: Quantity + Total Price + Add to Bag */}
              <div className="pt-3 border-t border-rose-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-burgundy-900 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer flex items-center justify-center"
                      title="Decrease quantity"
                    >
                      <Minus size={13} className="stroke-[2.5]" />
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 font-mono min-w-[28px] text-center select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-2.5 py-2 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer flex items-center justify-center"
                      title="Increase quantity"
                    >
                      <Plus size={13} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Right: Pricing + Add to Bag Button */}
                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-espresso-400 block leading-tight">Total Price:</span>
                    <span className="font-mono font-bold text-burgundy-900 text-base sm:text-lg leading-tight">
                      {formatPrice((selectedSize?.price || 1299) * quantity)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={preview.busy}
                    className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {preview.busy ? (
                      <>
                        <Sparkles className="animate-spin" size={15} />
                        <span>Adding…</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Fullscreen Lightbox Overlay */}
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
