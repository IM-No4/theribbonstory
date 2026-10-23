import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  Eye,
  X,
  ShoppingBag,
  RefreshCw,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore";
import { api, assetUrl } from "../api/client";
import { useSeo } from "../utils/seo";
import { useKeepsakePreview } from "../hooks/useKeepsakePreview";

export const FIGURINE_STYLE_OPTIONS = [
  {
    id: "chibi",
    name: "Cute Chibi",
    tagline: "Soft cute features & compact body",
    emoji: "🧸",
    isPopular: true,
  },
  {
    id: "caricature",
    name: "Fun Caricature",
    tagline: "Playful cartoon smile & expressive charm",
    emoji: "🎨",
  },
  {
    id: "realistic",
    name: "Mini Realistic",
    tagline: "True-to-life human anatomy & sculpt",
    emoji: "👤",
  },
  {
    id: "bobblehead",
    name: "Classic Bobblehead",
    tagline: "Expressive head & trophy pedestal",
    emoji: "🎪",
  },
];

const CATEGORY_MESSAGE_SUGGESTIONS = {
  single: [
    "Dream Big ✨",
    "Self Love First 💖",
    "Living My Best Life ⭐",
    "Born to Shine 💫",
    "Class of 2026 🎓",
    "One & Only 🌟",
  ],
  couple: [
    "Forever & Always ❤️",
    "Happy Anniversary 🥂",
    "You & Me Always 💖",
    "Better Together 💑",
    "From Day One 💍",
    "My Favorite Person ✨",
  ],
  family: [
    "Family First 👨‍👩‍👧",
    "Our Happy Place 🏡",
    "Together is Beautiful 🤍",
    "The Best Memories 🌻",
    "Roots & Wings 🌳",
    "Love Lives Here 💕",
  ],
  "kid-baby": [
    "Our Little Wonder ✨",
    "Tiny Hands, Big Heart 👣",
    "First Steps 🍼",
    "Pure Joy 🎈",
    "Our Sunshine ☀️",
    "Sweet Little One 🧸",
  ],
  kid: [
    "Our Little Wonder ✨",
    "Tiny Hands, Big Heart 👣",
    "First Steps 🍼",
    "Pure Joy 🎈",
    "Our Sunshine ☀️",
    "Sweet Little One 🧸",
  ],
  pet: [
    "Best Friends 🐾",
    "Forever in Our Hearts 🐶",
    "Good Boy / Girl 🎾",
    "Paws & Claws 🐾",
    "Furry Little Monster 🐱",
    "Unconditional Love 🦴",
  ],
};

const CATEGORY_PLACEHOLDERS = {
  single: "e.g. Dream Big ✨ / Ethan",
  couple: "e.g. Forever & Always ❤️ / Max & Emma",
  family: "e.g. Family First 👨‍👩‍👧 / The Sharmas",
  "kid-baby": "e.g. Our Little Wonder ✨ / Baby Liam",
  kid: "e.g. Our Little Wonder ✨ / Baby Liam",
  pet: "e.g. Best Friends 🐾 / Milo 🐶",
};

const CATEGORY_ARTISAN_PLACEHOLDERS = {
  single: "e.g. Highlight blue jacket, keep glasses, casual posture",
  couple: "e.g. Add anniversary date on side, match clothing colors, hold hands",
  family: "e.g. Keep relative heights accurate, include mom's scarf",
  "kid-baby": "e.g. Include favorite teddy bear, capture rosy cheeks",
  kid: "e.g. Include favorite teddy bear, capture rosy cheeks",
  pet: "e.g. Preserve ear spots, keep red collar with bell, fluffy tail",
};

const formatPrice = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function PersonalizedPage() {
  useSeo({
    title: "Create a Personalised 3D Keepsake | The Ribbon Story",
    description: "Upload a photo, preview your cute 3D figurine in seconds, choose size and engraving to create a handcrafted keepsake.",
  });

  const { addItem, openCart } = useCartStore();
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Dynamic Keepsake Categories & Pricing from Admin
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Inscription & Builder State
  const [inscriptionText, setInscriptionText] = useState("");
  const [artisanNote, setArtisanNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Fetch admin-defined keepsake categories on mount
  useEffect(() => {
    let isMounted = true;
    api
      .get("/keepsake-categories")
      .then(({ data }) => {
        if (!isMounted) return;
        const cats = data?.categories || [];
        setCategories(cats);
        if (cats.length > 0) {
          const targetSlug = categoryParam?.toLowerCase() || "couple";
          const defaultCat =
            cats.find((c) => c.slug.toLowerCase() === targetSlug) || cats[0];
          setSelectedCategory(defaultCat);
          const defaultOpt =
            defaultCat.pricingOptions?.find((o) => o.isPopular) ||
            defaultCat.pricingOptions?.[0] ||
            null;
          setSelectedOption(defaultOpt);
        }
      })
      .catch((err) => {
        console.error("Could not load keepsake categories", err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync category when URL search parameter changes
  useEffect(() => {
    if (categories.length > 0 && categoryParam) {
      const matching = categories.find(
        (c) => c.slug.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matching && matching.slug !== selectedCategory?.slug) {
        setSelectedCategory(matching);
        const defaultOpt =
          matching.pricingOptions?.find((o) => o.isPopular) ||
          matching.pricingOptions?.[0] ||
          null;
        setSelectedOption(defaultOpt);
      }
    }
  }, [categoryParam, categories]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat.slug });
    const defaultOpt =
      cat.pricingOptions?.find((o) => o.isPopular) || cat.pricingOptions?.[0] || null;
    setSelectedOption(defaultOpt);
  };

  // Dynamic Suggestions & Placeholders by Selected Keepsake Subject
  const categorySlug = selectedCategory?.slug?.toLowerCase() || "couple";
  const activeSuggestions =
    selectedCategory?.engravingSuggestions && selectedCategory.engravingSuggestions.length > 0
      ? selectedCategory.engravingSuggestions
      : CATEGORY_MESSAGE_SUGGESTIONS[categorySlug] || CATEGORY_MESSAGE_SUGGESTIONS.couple;

  const activePlaceholder =
    CATEGORY_PLACEHOLDERS[categorySlug] || "e.g. Forever & Always ❤️ / Max & Emma";

  const activeArtisanPlaceholder =
    CATEGORY_ARTISAN_PLACEHOLDERS[categorySlug] ||
    "e.g. Highlight blue jacket, preserve pet collar, keep glasses";

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

  const activeStyleObj =
    FIGURINE_STYLE_OPTIONS.find((s) => s.id === (preview.style || "chibi")) ||
    FIGURINE_STYLE_OPTIONS[0];

  // Dynamic Progress Timer & Percentage Counter during 3D generation
  const [genSeconds, setGenSeconds] = useState(0);

  useEffect(() => {
    if (!preview.busy) {
      setGenSeconds(0);
      return;
    }

    setGenSeconds(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setGenSeconds(elapsed);
    }, 500);

    return () => clearInterval(interval);
  }, [preview.busy]);

  const getProgressInfo = (sec) => {
    let pct = 5;
    let label = "Initializing 3D sculpting studio…";

    if (sec <= 4) {
      pct = Math.min(22, Math.round(5 + (sec / 4) * 17));
      label = "Analyzing photograph contours & face…";
    } else if (sec <= 14) {
      pct = Math.min(52, Math.round(22 + ((sec - 4) / 10) * 30));
      label = `Sculpting ${activeStyleObj.name} 3D geometry…`;
    } else if (sec <= 28) {
      pct = Math.min(78, Math.round(52 + ((sec - 14) / 14) * 26));
      label = "Forming outfit details & solid colors…";
    } else if (sec <= 42) {
      pct = Math.min(92, Math.round(78 + ((sec - 28) / 14) * 14));
      label = "Calibrating circular display pedestal…";
    } else {
      pct = Math.min(98, Math.round(92 + Math.min(6, (sec - 42) * 0.25)));
      label = "Finalizing 3D print-ready surfaces…";
    }

    return { pct, label, sec };
  };

  const progressInfo = getProgressInfo(genSeconds);

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
  const handleGeneratePreview = (overrideStyle) => {
    if (!hasPhoto || preview.busy) return;

    const styleToUse = overrideStyle || preview.style || "chibi";
    const promptNotes = buildPromptNotes();
    const extraData = {
      engravingText: inscriptionText.trim(),
      artisanNotes: artisanNote.trim(),
      style: styleToUse,
    };

    if (selectedFile) {
      preview.upload(selectedFile, promptNotes, extraData);
    } else if (preview.originalUrl) {
      preview.regenerate(promptNotes, extraData);
    }
  };

  // Regenerate with updated notes or updated style
  const handleRegenerateVariation = (overrideStyle) => {
    const styleToUse = overrideStyle || preview.style || "chibi";
    const promptNotes = buildPromptNotes();
    const extraData = {
      engravingText: inscriptionText.trim(),
      artisanNotes: artisanNote.trim(),
      style: styleToUse,
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
    if (categories.length > 0) {
      const defaultCat = categories.find((c) => c.slug === "couple") || categories[0];
      setSelectedCategory(defaultCat);
      setSelectedOption(
        defaultCat.pricingOptions?.find((o) => o.isPopular) ||
        defaultCat.pricingOptions?.[0] ||
        null
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add customized 3D keepsake to cart and clear form
  const handleAddToCart = () => {
    const design = preview.cartFields();
    if (!design) {
      toast.error("Please upload a photograph and wait for your 3D preview");
      return;
    }

    const currentCat = selectedCategory;
    const currentOpt = selectedOption;

    if (!currentOpt) {
      toast.error("Please select a size / dimension option");
      return;
    }

    const activeStyleObj = FIGURINE_STYLE_OPTIONS.find((s) => s.id === (preview.style || "chibi")) || FIGURINE_STYLE_OPTIONS[0];
    const unitPrice = currentOpt.price;
    const uniqueId = `custom-3d-${currentCat?.slug || "keepsake"}-${currentOpt._id || currentOpt.name}-${Date.now()}`;

    const combinedNotes = [
      currentCat ? `[Category: ${currentCat.name}]` : "",
      `[Style: ${activeStyleObj.name}]`,
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
      name: `Custom 3D Keepsake (${currentCat?.name || "Personalized"} - ${currentOpt.name} ${currentOpt.dimensions})`,
      image: cuteImage,
      price: unitPrice,
      sizeId: currentOpt._id || currentOpt.id || currentOpt.name || "small",
      quantity,
      selectedOptions: [
        { name: "Keepsake Category", value: currentCat?.name || "Personalized", priceDelta: 0 },
        { name: "3D Figurine Style", value: activeStyleObj.name, priceDelta: 0 },
        { name: "Size & Dimensions", value: `${currentOpt.name} (${currentOpt.dimensions})`, priceDelta: 0 },
      ],
      customization: {
        ...design.customization,
        category: currentCat?.name,
        categorySlug: currentCat?.slug,
        style: activeStyleObj.id,
        styleName: activeStyleObj.name,
        cuteImageUrl: cuteImage,
        reference3D: { approvedPreview: cuteImage },
        photoUrl: originalPhoto,
        size: currentOpt.name,
        dimensions: currentOpt.dimensions,
        customName: inscriptionText.trim(),
        note: combinedNotes || undefined,
      },
    });

    toast.success(`Added ${currentCat?.name || ""} (${activeStyleObj.name}) keepsake to your bag!`);

    // Clear form and open cart
    handleResetForm();
    openCart();
  };

  const displayOriginal = localPhotoUrl || preview.localPhoto || (preview.originalUrl ? assetUrl(preview.originalUrl) : null);
  const displayCute = preview.approvedPreview ? assetUrl(preview.approvedPreview) : null;

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-8 sm:pt-12 pb-16 relative overflow-hidden">
      {/* Ambient Warm Studio Lighting Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-amber-100/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Header - Spacious & Luxury Atelier */}
        <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-stone-200/80 shadow-2xs text-[10px] sm:text-[11px] font-bold text-stone-700 tracking-wider uppercase mb-3">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Personalized 3D Keepsakes</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-mono">Photo to Figurine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-stone-900 tracking-tight">
            Turn Your Memories Into 3D Keepsakes
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Transform your favorite photograph into an adorable, personalized 3D-printed figurine—a unique keepsake made to celebrate the moments that matter most.
          </p>

          {/* 3-Step Guided Progress Indicator */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mt-4 text-[10.5px] sm:text-xs font-semibold text-stone-600">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-2xs transition ${
              hasPhoto ? "bg-rose-50 text-rose-700 border-rose-200 font-bold" : "bg-white text-stone-700 border-stone-200"
            }`}>
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">1</span>
              <span>Upload Photo</span>
            </span>
            <span className="text-stone-300">→</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-bold">2</span>
              <span>Choose Size & Inscription</span>
            </span>
            <span className="text-stone-300">→</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-2xs transition ${
              hasPreview ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold" : "bg-white text-stone-500 border-stone-100"
            }`}>
              <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-bold">3</span>
              <span>3D Preview</span>
            </span>
          </div>
        </div>

        {/* Main Two-Card Row (Uploaded Photo / Dropzone on Left, Preview or Size Pricing on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-6">
          {/* LEFT CARD: Customer Photo Upload or Render */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.06)] border border-stone-200/80 flex flex-col h-[520px] sm:h-[550px] relative overflow-hidden">
            {!hasPhoto ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-stone-300/80 hover:border-rose-400 bg-gradient-to-b from-stone-50/60 to-rose-50/20 hover:from-rose-50/30 hover:to-rose-50/50 rounded-2xl text-center space-y-4 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-xs">
                  <Upload size={26} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-stone-900">
                    Select Your Photo
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Clear portraits, memories, or everyday photos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-primary py-2.5 px-8 text-xs font-bold uppercase tracking-wider shadow-sm mt-1 cursor-pointer"
                >
                  Select Photo
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between flex-1 min-h-0">
                {/* Symmetrical Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800">
                    <Camera size={14} className="text-stone-400" />
                    <span>Your Photo</span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200/70">
                    Reference
                  </span>
                </div>

                {/* Photo Frame - Completely Fills Space */}
                <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-stone-100/70 border border-stone-200/90 shadow-inner group min-h-0">
                  <img
                    src={displayOriginal}
                    alt="Your uploaded reference photo"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />

                  {/* Gradient shadow overlay for buttons */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                  {/* Floating Action Buttons directly over image */}
                  <div className="absolute bottom-3.5 inset-x-0 flex items-center justify-center gap-2 z-10 px-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={preview.busy}
                      className="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-lg backdrop-blur-md border border-white/80 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Choose another photo"
                    >
                      <Upload size={13} className="text-rose-600" />
                      <span>Change Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setZoomImage({ src: displayOriginal, title: "Your Uploaded Photo" })}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="View Fullscreen"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CARD: Dimensions & Pricing + Inscription (before generation) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.06)] border border-stone-200/80 flex flex-col h-[520px] sm:h-[550px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!hasPreview ? (
                /* STATE 1: Before Generation -> Configure Size, Engraving & Notes, then Click Generate */
                <motion.div
                  key="pricing-options-initial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex flex-col justify-center space-y-3.5"
                >
                  <div className="space-y-3.5">
                    {/* Dimensions & Pricing Tiers for Selected Category */}
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                            Choose Size & Dimensions
                          </label>
                          <p className="text-[11px] text-stone-500">
                            Dimensions for your <span className="font-semibold text-rose-600">{selectedCategory?.name || ""}</span> keepsake
                          </p>
                        </div>
                        {selectedOption && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80 font-mono">
                            {selectedOption.dimensions}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(selectedCategory?.pricingOptions || []).map((opt) => {
                          const isSelected =
                            (selectedOption?._id && selectedOption?._id === opt._id) ||
                            selectedOption?.name === opt.name;
                          return (
                            <button
                              key={opt._id || opt.name}
                              type="button"
                              onClick={() => setSelectedOption(opt)}
                              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-center relative ${
                                isSelected
                                  ? "border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-400/20 scale-[1.02]"
                                  : "border-stone-200 hover:border-stone-300 bg-white"
                              }`}
                            >
                              {opt.isPopular && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500 text-white whitespace-nowrap shadow-2xs">
                                  Most Loved
                                </span>
                              )}
                              <div>
                                <div className={`font-display font-bold text-xs ${isSelected ? "text-rose-950" : "text-stone-900"}`}>
                                  {opt.name}
                                </div>
                                <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
                                  {opt.dimensions}
                                </div>
                              </div>

                              <div className="mt-2 pt-1 border-t border-stone-100 w-full">
                                <div className="font-bold text-stone-900 text-xs font-mono">
                                  {formatPrice(opt.price)}
                                </div>
                                {opt.compareAtPrice > opt.price && (
                                  <div className="text-[9px] text-stone-400 line-through">
                                    {formatPrice(opt.compareAtPrice)}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Message / Inscription with Suggestions */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                          Engraved Base Text
                        </label>
                        <span className="text-[10px] text-stone-400 font-semibold">Optional</span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={inscriptionText}
                        onChange={(e) => setInscriptionText(e.target.value)}
                        placeholder={activePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800/20 text-xs text-stone-900 placeholder:text-stone-400 transition"
                      />

                      {/* Clickable Category-Specific Suggestion Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {activeSuggestions.map((suggestion) => {
                          const isCurrent = inscriptionText === suggestion;
                          return (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setInscriptionText(isCurrent ? "" : suggestion)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] transition cursor-pointer font-medium border ${
                                isCurrent
                                  ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                  : "bg-stone-100/80 hover:bg-rose-50 hover:text-rose-700 text-stone-700 border-stone-200/70"
                              }`}
                            >
                              {suggestion}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3D Figurine Style Selector Chips */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-900">
                          3D Figurine Style
                        </label>
                        <span className="text-[10px] text-stone-400 font-semibold">
                          Choose Aesthetic
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {FIGURINE_STYLE_OPTIONS.map((st) => {
                          const isSelected = (preview.style || "chibi") === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => {
                                preview.setStyle(st.id);
                                if (hasPreview && !preview.busy) {
                                  toast(`Switched to ${st.name}!`, { icon: st.emoji });
                                }
                              }}
                              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2 text-left relative ${
                                isSelected
                                  ? "border-rose-500 bg-rose-50/80 shadow-xs ring-1 ring-rose-400/30 text-rose-950 font-bold"
                                  : "border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60 text-stone-700"
                              }`}
                            >
                              <span className="text-lg shrink-0 leading-none">{st.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold leading-tight truncate">
                                  {st.name}
                                </div>
                                <div className="text-[9.5px] text-stone-500 truncate leading-tight mt-0.5">
                                  {st.tagline}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Button: Generate 3D Preview (Hidden while processing) */}
                    {!preview.busy && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleGeneratePreview}
                          disabled={!hasPhoto}
                          className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all duration-200 select-none ${
                            !hasPhoto
                              ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none"
                              : "btn-primary shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                          }`}
                        >
                          <Sparkles
                            size={16}
                            className={hasPhoto ? "text-amber-300 animate-pulse" : "text-stone-400"}
                          />
                          <span>
                            {!hasPhoto
                              ? "Select Photo to Generate Preview"
                              : "Generate 3D Preview"}
                          </span>
                        </button>
                      </div>
                    )}
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
                  className="w-full h-full flex flex-col justify-between flex-1 min-h-0"
                >
                  {preview.busy ? (
                    <div className="w-full h-full flex flex-col justify-between flex-1 min-h-0">
                      {/* Symmetrical Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-950">
                          <Sparkles size={14} className="text-rose-500 animate-spin" />
                          <span>3D Figurine Preview</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
                          {activeStyleObj.emoji} {activeStyleObj.name}
                        </span>
                      </div>

                      {/* Processing Center Body - Completely Fills Space */}
                      <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-rose-50/50 border border-rose-200/80 shadow-xs flex flex-col items-center justify-center p-6 text-center select-none min-h-0">
                        {/* Subtle ambient pastel glow */}
                        <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-200/40 rounded-full blur-3xl animate-pulse" />
                        <div
                          className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-200/40 rounded-full blur-3xl animate-pulse"
                          style={{ animationDelay: "1s" }}
                        />

                        {/* Spinning Ring Animation */}
                        <div className="relative mb-3">
                          <div
                            className="w-20 h-20 rounded-full border-2 border-dashed border-rose-400 animate-spin"
                            style={{ animationDuration: "10s" }}
                          />
                          <div
                            className="absolute inset-2 rounded-full border border-rose-200 animate-spin"
                            style={{ animationDuration: "6s", animationDirection: "reverse" }}
                          />
                          <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                              <Sparkles className="text-ribbon-500 animate-pulse" size={22} />
                            </div>
                          </div>
                        </div>

                        <div className="relative z-10 space-y-1.5 max-w-[280px]">
                          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100/90 border border-rose-200 text-[10px] font-bold text-ribbon-700 uppercase tracking-wider">
                            <Sparkles size={11} className="text-ribbon-500" />
                            <span>Sculpting in Progress</span>
                          </div>
                          <h4 className="font-display font-bold text-sm sm:text-base text-burgundy-900 tracking-wide transition-all duration-300">
                            {progressInfo.label}
                          </h4>
                          <p className="text-xs text-espresso-500 leading-relaxed">
                            Crafting your personalized {activeStyleObj.name} figurine for 3D printing.
                          </p>
                        </div>

                        {/* Visual Progress Bar - Cleanly Shows Percent in One Place */}
                        <div className="relative z-10 w-full max-w-[270px] mt-4 space-y-1.5">
                          <div className="w-full h-2.5 bg-rose-100/80 rounded-full overflow-hidden p-0.5 border border-rose-200/70 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-rose-500 via-rose-600 to-amber-400 rounded-full transition-all duration-500 relative"
                              style={{ width: `${progressInfo.pct}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono px-1">
                            <span className="font-bold text-rose-700">{progressInfo.pct}% Completed</span>
                            <span>{progressInfo.sec}s elapsed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : preview.status === "ready" && displayCute ? (
                    /* RENDERED 3D FIGURINE */
                    <div className="w-full h-full flex flex-col justify-between">
                      {/* Symmetrical Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-950">
                          <Sparkles size={14} className="text-rose-500" />
                          <span>3D Figurine Preview</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                            {FIGURINE_STYLE_OPTIONS.find((s) => s.id === preview.style)?.emoji}{" "}
                            {FIGURINE_STYLE_OPTIONS.find((s) => s.id === preview.style)?.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span>3D Print Ready</span>
                          </span>
                        </div>
                      </div>

                      {/* Figurine Photo Frame - Symmetrical to Left Frame */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-white to-stone-50/40 border border-stone-200/90 shadow-xs flex items-center justify-center group">
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
                            className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Zoom</span>
                          </button>
                        </div>
                      </div>

                      {/* Multiple Variations Strip */}
                      {preview.attempts?.length > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          {preview.attempts.map((url, i) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => preview.select(i)}
                              className={`w-10 h-10 rounded-xl overflow-hidden border-2 bg-white transition p-0.5 cursor-pointer ${
                                i === preview.selected
                                  ? "border-rose-500 ring-2 ring-rose-400/30 scale-105"
                                  : "border-stone-200 hover:border-stone-300 opacity-70"
                              }`}
                            >
                              <img src={assetUrl(url)} alt="" className="w-full h-full object-contain" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Symmetrical Retry / Regenerate Variation Button */}
                      <button
                        type="button"
                        onClick={handleRegenerateVariation}
                        disabled={preview.busy || (preview.attemptsLeft ?? 0) <= 0}
                        className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs mt-3 shrink-0"
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
                    /* Fallback: Seamlessly fills the card with symmetrical height & styling */
                    <div className="w-full h-full flex flex-col justify-between flex-1 min-h-0">
                      {/* Symmetrical Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-950">
                          <Sparkles size={14} className="text-rose-500" />
                          <span>3D Figurine Preview</span>
                        </div>
                        <div className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] font-bold shadow-2xs">
                          <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>High Demand • In Queue</span>
                        </div>
                      </div>

                      {/* Informative Center Body - Completely Fills Space with Retry Button Inside */}
                      <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-gradient-to-b from-rose-50/40 via-white to-amber-50/20 border border-stone-200/80 shadow-xs flex flex-col items-center justify-center p-6 text-center select-none min-h-0 space-y-3.5">
                        {/* Ambient background glow */}
                        <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />

                        {/* Photo Thumbnail in Artisan Frame */}
                        {displayOriginal && (
                          <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-2 ring-rose-200/60 bg-rose-50 shrink-0">
                            <img
                              src={displayOriginal}
                              alt="Uploaded keepsake photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="relative z-10 space-y-1 max-w-xs">
                          <h4 className="font-display font-bold text-sm sm:text-base text-stone-900">
                            Handcrafted 3D Modeling Ready
                          </h4>
                          <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                            Your reference photo is archived. Our 3D modeling artisans will personally calibrate and sculpt your figurine during production.
                          </p>
                        </div>

                        {/* Retry Button INSIDE the same card */}
                        <button
                          type="button"
                          onClick={handleGeneratePreview}
                          disabled={preview.busy}
                          className="relative z-10 px-5 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold text-rose-700 transition flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50 mt-1"
                        >
                          <RefreshCw size={13} className={preview.busy ? "animate-spin" : ""} />
                          <span>Retry 3D Preview</span>
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
              {/* Dimensions & Pricing Tiers for Selected Category */}
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2.5">
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-stone-900">
                      Choose Size & Dimensions
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Select dimensions and finish for your <span className="font-semibold text-rose-600">{selectedCategory?.name || ""}</span> keepsake.
                    </p>
                  </div>

                  {selectedOption && (
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
                      {selectedOption.name} ({selectedOption.dimensions})
                    </span>
                  )}
                </div>

                  {/* Size Cards - Compact */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(selectedCategory?.pricingOptions || []).map((opt) => {
                      const isSelected =
                        (selectedOption?._id && selectedOption?._id === opt._id) ||
                        selectedOption?.name === opt.name;
                      return (
                        <div
                          key={opt._id || opt.name}
                          onClick={() => setSelectedOption(opt)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-center relative ${
                            isSelected
                              ? "border-rose-500 bg-rose-50/90 shadow-sm ring-2 ring-rose-400/30 scale-[1.01]"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          {opt.isPopular && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white whitespace-nowrap shadow-2xs">
                              Most Loved
                            </span>
                          )}
                          <div>
                            <div className={`font-display font-bold text-sm ${isSelected ? "text-rose-900" : "text-burgundy-900"}`}>
                              {opt.name}
                            </div>
                            <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
                              {opt.dimensions}
                            </div>
                            {opt.description && (
                              <p className="text-[10px] text-espresso-400 mt-0.5 leading-snug">
                                {opt.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-center gap-2">
                            <span className="font-bold text-slate-900 text-sm font-mono">
                              {formatPrice(opt.price)}
                            </span>
                            {opt.compareAtPrice > opt.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatPrice(opt.compareAtPrice)}
                              </span>
                            )}
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
                      {formatPrice((selectedOption?.price || 1199) * quantity)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={preview.busy}
                    className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <ShoppingBag size={15} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Atelier Craftsmanship & Reassurance Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-10">
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-2xs flex items-start gap-3">
            <span className="text-xl shrink-0">📸</span>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Photo Privacy</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                Never shared. Deleted permanently after order delivery.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-2xs flex items-start gap-3">
            <span className="text-xl shrink-0">🪵</span>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Engraved Stand</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                Solid walnut wood display pedestal included free.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-2xs flex items-start gap-3">
            <span className="text-xl shrink-0">🎨</span>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Solid Studio Colors</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                Clean solid colors with 0.08mm precision finish.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-2xs flex items-start gap-3">
            <span className="text-xl shrink-0">📦</span>
            <div>
              <h4 className="text-xs font-bold text-stone-900">Crush-Proof Box</h4>
              <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
                Dense foam luxury packaging delivered pan-India.
              </p>
            </div>
          </div>
        </div>

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
