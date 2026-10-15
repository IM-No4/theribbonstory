import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Truck,
  Heart,
  Eye,
  Zap,
  Box,
  Camera,
  RotateCw,
} from "lucide-react";
import { api, assetUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import { useSeo } from "../utils/seo";

// Verified 3D Enthusiast Reviews
const REVIEWS = [
  {
    name: "Vikram & Sneha",
    city: "Bengaluru",
    rating: 5,
    product: "Custom 3D Couple Keepsake",
    text: "Uploaded our engagement picture and the 3D figurine turned out unbelievable! The clothes matched our photo colors and the engraved base with our date is such a classy touch.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    name: "Arjun Mehta",
    city: "Mumbai",
    rating: 5,
    product: "Articulated Crystal Dragon",
    text: "The silk dual-tone shine on this dragon is mesmerizing! Every single joint flexes smoothly right out of the box with zero stiff spots. Truly premium 3D print quality.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    name: "Dr. Rohini Verma",
    city: "Pune",
    rating: 5,
    product: "Geometric Succulent Planter",
    text: "Sturdy, perfectly watertight, and the hexagonal facets catch the morning sunlight beautifully on my windowsill. The matching drainage tray fits seamlessly.",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
];

const KEEPSAKE_CATEGORY_IMAGES = {
  single: "/images/3d-single-keepsake.jpg",
  couple: "/images/3d-couple-keepsake.webp",
  family: "/images/3d-family-keepsake.webp",
  "kid-baby": "/images/3d-kid-keepsake.jpg",
  kid: "/images/3d-kid-keepsake.jpg",
  baby: "/images/3d-kid-keepsake.jpg",
  pet: "/images/3d-dog-keepsake.webp",
};

const DEFAULT_KEEPSAKE_CARDS = [
  {
    name: "Single",
    slug: "single",
    icon: "👤",
    tagline: "Solo portrait & character",
    description: "Self-avatars, graduates, portraits, and individual character sculpts.",
    image: "/images/3d-single-keepsake.jpg",
    pricingOptions: [{ price: 699, compareAtPrice: 1199, dimensions: '3.5" (9 cm)' }],
  },
  {
    name: "Couple",
    slug: "couple",
    icon: "👩‍❤️‍👨",
    tagline: "Anniversaries & couples",
    description: "Two figures sculpted together in harmony on an elegant wooden pedestal.",
    image: "/images/3d-couple-keepsake.webp",
    pricingOptions: [{ price: 1499, compareAtPrice: 2399, dimensions: '5.0" (13 cm)' }],
    isPopular: true,
  },
  {
    name: "Family",
    slug: "family",
    icon: "👨‍👩‍👧",
    tagline: "3–5 Family members",
    description: "Heartwarming multi-figure family portrait capturing loved ones together.",
    image: "/images/3d-family-keepsake.webp",
    pricingOptions: [{ price: 2499, compareAtPrice: 3999, dimensions: '5.5" (14 cm)' }],
  },
  {
    name: "Kid & Baby",
    slug: "kid",
    icon: "👶",
    tagline: "Children & milestones",
    description: "Precious baby milestones, childhood memories, and birthdays in 3D.",
    image: "/images/3d-kid-keepsake.jpg",
    pricingOptions: [{ price: 649, compareAtPrice: 1099, dimensions: '3.5" (9 cm)' }],
  },
  {
    name: "Pet",
    slug: "pet",
    icon: "🐾",
    tagline: "Dogs, cats & companions",
    description: "Beloved furry friends, dogs, and cats sculpted in realistic detail.",
    image: "/images/3d-dog-keepsake.webp",
    pricingOptions: [{ price: 699, compareAtPrice: 1199, dimensions: '3.5" (9 cm)' }],
  },
];

export default function Home() {
  useSeo({ path: "/" });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keepsakeCategories, setKeepsakeCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [previewSize, setPreviewSize] = useState("classic");

  // Half Real / Half 3D Split State (0 = 100% 3D, 50 = Split, 100 = 100% Original Photo)
  const [splitPercent, setSplitPercent] = useState(50);
  const [activeSide, setActiveSide] = useState("split"); // "original" | "split" | "3d"
  const splitContainerRef = useRef(null);

  const navigate = useNavigate();

  // Fetch 3D catalog, collections, and keepsake categories from database
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/products"),
      api.get("/categories"),
      api.get("/keepsake-categories"),
    ])
      .then(([prodRes, catRes, keepsakeRes]) => {
        if (!active) return;
        setProducts(prodRes.data?.products || []);
        setCategories(catRes.data?.categories || []);
        if (keepsakeRes.data?.categories?.length > 0) {
          setKeepsakeCategories(keepsakeRes.data.categories);
        }
      })
      .catch((err) => console.error("Error fetching data from database:", err))
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadingCategories(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Filter products by selected 3D category tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    return p.category === activeTab;
  });

  // Handle interactive mouse hover over the split image container
  const handleMouseMove = (e) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;

    if (ratio < 0.42) {
      // Hovering left side -> reveal complete original photo
      setSplitPercent(100);
      setActiveSide("original");
    } else if (ratio > 0.58) {
      // Hovering right side -> reveal complete 3D printed model
      setSplitPercent(0);
      setActiveSide("3d");
    } else {
      // Centered hover
      setSplitPercent(50);
      setActiveSide("split");
    }
  };

  const handleMouseLeave = () => {
    setSplitPercent(50);
    setActiveSide("split");
  };

  return (
    <div className="min-h-screen bg-[#FBF9F7] text-slate-800">
      {/* =========================================================================
          1. HERO SECTION: VIEWPORT-FITTING HERO (TEXT ON LEFT, SPLIT IMAGE ON RIGHT)
         ========================================================================= */}
      <section className="relative min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)] flex items-center justify-center py-6 lg:py-0 px-4 sm:px-6 lg:px-10 overflow-hidden border-b border-stone-200/70 bg-[#FAF8F5]">
        {/* Luxury Studio Canvas Background with Travertine & Architectural Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Architectural Travertine Plaster & Natural Sunlight Photo */}
          <img
            src="/images/studio-bg.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-50 filter contrast-[1.06] brightness-[1.02]"
          />
          {/* Soft Cashmere Studio Scrims for perfect text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/92 via-[#FAF8F5]/75 to-[#FAF8F5]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-[#FAF8F5]/50" />
          {/* Warm Champagne & Rose Atelier Spotlight */}
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-amber-200/40 via-rose-200/25 to-transparent rounded-full blur-3xl pointer-events-none" />
          {/* Subtle Precision CAD Micro-Dots */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(60, 45, 30, 0.8) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">
            {/* -----------------------------------------------------------------
                LEFT COLUMN: Grand Display Text, Value Props & Clear CTA Buttons
               ----------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-6 xl:col-span-6 space-y-3.5 sm:space-y-4 text-left"
            >
              {/* Studio Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[10px] sm:text-[11px] font-bold text-stone-700 tracking-wider uppercase">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Personalized 3D Keepsakes</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500 font-mono">Photo to Figurine</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] font-display font-extrabold text-stone-900 tracking-tight leading-[1.14]">
                  Turn Your Favorite Photos Into 3D Keepsakes
                </h1>
                <p className="text-xs sm:text-[13px] md:text-sm text-stone-600 leading-relaxed max-w-lg">
                  Transform your favorite couple, family, or pet photo into an adorable, personalized chibi-style 3D-printed figurine. Choose a memorable design in clean, solid colors and turn a special moment into something you can keep forever.
                </p>
              </div>

              {/* Action Buttons: Primary Personalize + Secondary Ready-to-Ship */}
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => navigate("/personalized")}
                  className="btn-primary py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-[13px] font-bold tracking-wider uppercase gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Personalize Your 3D Keepsake</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/shop")}
                  className="btn-secondary py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-[13px] font-semibold tracking-wide cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white shadow-2xs transition-all"
                >
                  <span>Browse 3D Models</span>
                </button>
              </div>

              {/* Feature Highlights: Streamlined Luxury Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200/60">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-semibold text-stone-700">
                  <span>📸</span>
                  <span>Any Photo (Couple, Pet, Solo)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-semibold text-stone-700">
                  <span>🎨</span>
                  <span>Clean, Solid Colors</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-semibold text-stone-700">
                  <span>🧸</span>
                  <span>Cute, Personalized 3D Figurines</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-2xs text-[11px] font-semibold text-stone-700">
                  <span>💝</span>
                  <span>A Keepsake Made From Your Memories</span>
                </span>
              </div>

              {/* Social Proof Metric */}
              <div className="flex items-center gap-2 pt-0.5 text-xs text-stone-600">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={11} className="fill-current" />
                  ))}
                </div>
                <span className="font-bold text-stone-800">4.9 / 5.0 Rating</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500">2,400+ Keepsakes Crafted Pan-India</span>
              </div>
            </motion.div>

            {/* -----------------------------------------------------------------
                RIGHT COLUMN: HALF REAL / HALF 3D INTERACTIVE SPLIT SHOWCASE
               ----------------------------------------------------------------- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-6 xl:col-span-6 flex justify-center items-center"
            >
              <div className="w-full flex justify-center items-center">
                {/* THE INTERACTIVE SPLIT CARD */}
                <div
                  ref={splitContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative aspect-[944/1600] h-[min(540px,calc(100vh-140px))] max-w-[min(340px,92vw)] w-auto rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(28,25,23,0.2),0_0_30px_rgba(244,63,94,0.08)] border border-white/90 ring-1 ring-stone-900/10 select-none group cursor-ew-resize bg-stone-100"
                >
                  {/* LAYER 1 (BOTTOM): 3D Printed Figurine */}
                  <img
                    src="/images/keepsake-3d.jpeg"
                    alt="3D Printed Keepsake Figurine"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />

                  {/* LAYER 2 (TOP): Real Portrait Photo clipped by splitPercent */}
                  <div
                    className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
                    style={{
                      clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                    }}
                  >
                    <img
                      src="/images/real-photo.jpeg"
                      alt="Original Portrait Photograph"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* DIVIDING VERTICAL LINE (Visible in Split Mode) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-300 ease-out z-20"
                    style={{
                      left: `${splitPercent}%`,
                      opacity: splitPercent > 3 && splitPercent < 97 ? 1 : 0,
                    }}
                  >
                    {/* Center Handle Badge */}
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white/95 backdrop-blur-md border-2 border-rose-500 shadow-xl flex items-center justify-center text-rose-600">
                      <span className="text-[11px] font-black font-mono">⇄</span>
                    </div>
                  </div>

                  {/* FLOATING STATUS BADGES */}
                  {/* Left Badge: Real Photo */}
                  <div
                    className={`absolute top-3.5 left-3.5 transition-all duration-300 z-30 pointer-events-none ${
                      splitPercent > 20 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md transition-colors ${
                        activeSide === "original"
                          ? "bg-rose-500 text-white ring-2 ring-white"
                          : "bg-stone-900/80 text-white"
                      }`}
                    >
                      <Camera size={12} />
                      <span>Original Photo</span>
                    </span>
                  </div>

                  {/* Right Badge: 3D Printed Figurine */}
                  <div
                    className={`absolute top-3.5 right-3.5 transition-all duration-300 z-30 pointer-events-none ${
                      splitPercent < 80 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md transition-colors ${
                        activeSide === "3d"
                          ? "bg-rose-500 text-white ring-2 ring-white"
                          : "bg-stone-900/80 text-white"
                      }`}
                    >
                      <Sparkles size={12} className="text-amber-300" />
                      <span>3D Model</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. VISUAL 3D CATEGORY BENTO GRID (With Real 3D Studio Product Photos)
         ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 bg-white border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block mb-1">
                Visual Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-stone-900">
                Explore by 3D Collection
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
                Ready-to-ship physical models printed on industrial multi-color FDM printers.
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-ribbon-600 hover:text-ribbon-700 flex items-center gap-1 group py-1"
            >
              <span>View All 3D Models</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Dynamic Collections from Database */}
          {loadingCategories ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-3xl bg-stone-100/80 animate-pulse border border-stone-200/60" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat._id || cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  className="group relative rounded-3xl bg-[#FAF8F5] border border-stone-200/80 hover:border-ribbon-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Visual Image Header */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-stone-100">
                    <img
                      src={assetUrl(cat.image || "/images/photo-magnet.webp")}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                      onError={(e) => {
                        e.target.src = "/images/photo-magnet.webp";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Top Badge */}
                    {cat.badge && (
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs bg-rose-600">
                          {cat.badge}
                        </span>
                      </div>
                    )}

                    {/* Bottom Counter Pill */}
                    <div className="absolute bottom-3 right-3">
                      <span className="text-[10px] font-semibold text-white/95 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
                        {cat.productCount !== undefined ? `${cat.productCount} Models` : "Explore"}
                      </span>
                    </div>
                  </div>

                  {/* Card Text Content */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-3 bg-white">
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-stone-900 group-hover:text-ribbon-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                        {cat.description || "Handcrafted 3D creation collection"}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-ribbon-600 group-hover:text-ribbon-700">
                      <span>Browse Collection</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED PRODUCTS CATALOG (Filterable Tabs for Ready 3D Models)
         ========================================================================= */}
      <section id="printed-catalog-section" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block">
              Curated Highlights
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-stone-900">
              Featured 3D Printed Creations
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Calibrated layer heights, smooth tactile ball joints, and non-toxic bio-PLA materials.
            </p>
          </div>

          {/* Dynamic Filter Tabs from Database */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All Creations" },
              ...categories.map((c) => ({ id: c.slug, label: c.name })),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-ribbon-500 text-white shadow-xs"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-ribbon-300 shadow-2xs"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded-2xl border border-stone-200 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map((product, idx) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  index={idx}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onPersonalize={(p) => {
                    if (p.category === "personalized-3d" || p.slug === "custom-3d-keepsake-figurine") {
                      navigate("/personalized");
                    } else {
                      setSelectedProduct(p);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <p className="text-xs text-stone-400">No models found in this category.</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/shop"
              className="btn-secondary py-3.5 px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs hover:shadow"
            >
              <span>Browse Full 3D Catalog ({products.length} Models)</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PERSONALIZED 3D STUDIO EXPERIENCE (Keepsake Categories Showcase)
         ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] text-white relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-400" />
              <span>Custom Keepsake Atelier</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              Turn Any Photograph Into a Handcrafted 3D Figurine
            </h2>

            <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Upload your photo and our studio sculpts an adorable stylized chibi 3D figurine in solid multi-color bio-PLA, mounted on a laser-engraved wooden pedestal. Choose your subject to start:
            </p>
          </div>

          {/* Keepsake Categories Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {(keepsakeCategories.length > 0 ? keepsakeCategories : DEFAULT_KEEPSAKE_CARDS).map((cat) => {
              const rawImg = cat.image || KEEPSAKE_CATEGORY_IMAGES[cat.slug] || "/images/3d-single-keepsake.jpg";
              const imageSrc = assetUrl(rawImg);
              const startingPrice = cat.pricingOptions?.length
                ? Math.min(...cat.pricingOptions.map((o) => o.price))
                : 699;
              const compareAt = cat.pricingOptions?.[0]?.compareAtPrice;

              return (
                <Link
                  key={cat._id || cat.slug}
                  to={`/personalized?category=${cat.slug}`}
                  className="group relative bg-white/[0.07] hover:bg-white/[0.12] backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-white/15 hover:border-rose-400/60 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-rose-950/50 text-left overflow-hidden cursor-pointer"
                >
                  {/* Popular badge */}
                  {(cat.isPopular || cat.slug === "couple") && (
                    <span className="absolute top-3.5 right-3.5 z-10 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-md">
                      Most Loved
                    </span>
                  )}

                  <div className="space-y-3.5">
                    {/* Visual Photo / Render Thumbnail */}
                    <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 group-hover:border-rose-400/40 transition">
                      <img
                        src={imageSrc}
                        alt={`${cat.name} 3D Keepsake`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Floating Subject Icon Badge */}
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xs">
                        <span className="text-sm leading-none">{cat.icon || "👤"}</span>
                        <span>{cat.name}</span>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div>
                      <h3 className="font-display font-bold text-base text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                        <span>{cat.name} Keepsake</span>
                      </h3>
                      {cat.tagline && (
                        <p className="text-[11px] font-semibold text-rose-300/90 mt-0.5">
                          {cat.tagline}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-300 line-clamp-2 mt-1 leading-snug">
                        {cat.description || "Personalized 3D figurine sculpt from your photo with custom laser engraving."}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & CTA Button */}
                  <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider">Starts at</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition">
                          ₹{startingPrice.toLocaleString("en-IN")}
                        </span>
                        {compareAt > startingPrice && (
                          <span className="font-mono text-[10px] text-stone-400 line-through">
                            ₹{compareAt.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-rose-500/80 group-hover:bg-rose-500 text-white shadow-xs group-hover:translate-x-0.5 transition-all">
                      <span>Create</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Trust & Direct Studio CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-stone-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-rose-400" />
                <span>Upload Any Clear Photo</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-rose-400" />
                <span>Laser-Engraved Solid Base Plaque</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-rose-400" />
                <span>High-Precision Bio-PLA Molding</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/personalized"
                className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>Launch 3D Customizer</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/how-it-works"
                className="text-xs font-semibold text-rose-300 hover:text-white underline px-2 py-1"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CRAFTSMANSHIP & TECHNOLOGY TRUST STRIP
         ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-10 bg-white border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col items-center justify-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-rose-500 shadow-2xs">
              <Layers size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              Photo to Figurine
            </h4>
            <p className="text-xs text-stone-500 leading-snug">
              Printed on industrial multi-color FDM systems with ultra-smooth layer bonds.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col items-center justify-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              Non-Toxic Bio-PLA
            </h4>
            <p className="text-xs text-stone-500 leading-snug">
              Odor-free, durable, eco-friendly filaments safe for desktops and home spaces.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col items-center justify-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-teal-600 shadow-2xs">
              <Box size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              Watertight Infill
            </h4>
            <p className="text-xs text-stone-500 leading-snug">
              Engineered density walls tested for live plants, soil moisture, and durability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-100 flex flex-col items-center justify-center space-y-2 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Truck size={20} />
            </div>
            <h4 className="font-display font-bold text-sm text-stone-900">
              Drop-Proof Shipping
            </h4>
            <p className="text-xs text-stone-500 leading-snug">
              Custom foam-cushioned packaging ensuring zero transit breakage across India.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. VERIFIED CUSTOMER STORIES
         ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block">
              Verified Collector Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900">
              What 3D Enthusiasts Say
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={15} className="fill-current" />
              ))}
              <span className="text-xs font-bold text-stone-700 ml-2">4.9 / 5.0 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, rIdx) => (
                        <Star key={rIdx} size={13} className="fill-current" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 italic leading-relaxed">
                    &quot;{rev.text}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <img
                    src={rev.img}
                    alt={rev.name}
                    className="h-10 w-10 rounded-full object-cover border border-rose-200"
                  />
                  <div>
                    <h4 className="font-display font-bold text-sm text-stone-900">{rev.name}</h4>
                    <p className="text-[11px] text-stone-400">{rev.city} • {rev.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={(p) => {
          setQuickViewProduct(null);
          if (p.category === "personalized-3d" || p.slug === "custom-3d-keepsake-figurine") {
            navigate("/personalized");
          } else {
            setSelectedProduct(p);
          }
        }}
      />

      {/* Product Customizer Modal */}
      {selectedProduct && (
        <ProductCustomizerModal
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
