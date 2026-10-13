import { useState, useEffect } from "react";
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
} from "lucide-react";
import { api, assetUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import { useSeo } from "../utils/seo";

// Curated 3D Printing Categories
const PRINTED_CATEGORIES = [
  {
    id: "articulated",
    slug: "articulated",
    name: "Articulated & Flexi",
    tagline: "Fluid multi-jointed dragons & fidget beasts",
    badge: "Trending",
    badgeColor: "bg-emerald-600",
    img: "/images/3d-dog-keepsake.webp",
    to: "/shop?category=articulated",
    itemCount: "Dragons & Flexis",
  },
  {
    id: "animals",
    slug: "animals",
    name: "Animals & Wildlife",
    tagline: "Geometric low-poly sculptures & desk pets",
    badge: "Popular",
    badgeColor: "bg-amber-500",
    img: "/images/pet-keepsake.webp",
    to: "/shop?category=animals",
    itemCount: "Statues & Minis",
  },
  {
    id: "pots-planters",
    slug: "pots-planters",
    name: "Pots, Planters & Vases",
    tagline: "Modern geometric succulent pots & spiral vases",
    badge: "Home Decor",
    badgeColor: "bg-teal-600",
    img: "/images/gifts-for-housewarming.webp",
    to: "/shop?category=pots-planters",
    itemCount: "Watertight Decor",
  },
  {
    id: "candle-holders",
    slug: "candle-holders",
    name: "Candle Holders & Lights",
    tagline: "Lotus tealight pedestals & shadow lanterns",
    badge: "Ambient Glow",
    badgeColor: "bg-rose-500",
    img: "/images/anniversary.webp",
    to: "/shop?category=candle-holders",
    itemCount: "Shadow Projections",
  },
  {
    id: "festival",
    slug: "festival",
    name: "Festival & Cultural",
    tagline: "Diwali diyas, modern sacred idols & decor",
    badge: "Festive Art",
    badgeColor: "bg-amber-600",
    img: "/images/gifts-for-parents.webp",
    to: "/shop?category=festival",
    itemCount: "Mandir & Home",
  },
  {
    id: "desk-accessories",
    slug: "desk-accessories",
    name: "Desk & Gadgets",
    tagline: "Headphone perches, phone docks & organizers",
    badge: "Functional",
    badgeColor: "bg-blue-600",
    img: "/images/gifts-for-him.webp",
    to: "/shop?category=desk-accessories",
    itemCount: "Tech Upgrades",
  },
];

// Verified 3D Printing Customer Reviews
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

export default function Home() {
  useSeo({ path: "/" });
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();

  // Fetch 3D catalog
  useEffect(() => {
    let active = true;
    api
      .get("/products")
      .then((res) => {
        if (!active) return;
        setProducts(res.data?.products || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
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

  return (
    <div className="space-y-0 overflow-hidden bg-[#FAF7F5]">
      {/* =========================================================================
          1. DUAL-PILLAR HERO SECTION (Two Clear Paths: Ready 3D vs Personalized)
         ========================================================================= */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-xs font-bold text-ribbon-700 uppercase tracking-wider">
              <Sparkles size={12} className="text-ribbon-500" />
              The 3D Printing Atelier
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-burgundy-900 tracking-tight leading-tight">
              Precision 3D Creations &amp; Custom Keepsakes
            </h1>
            <p className="text-xs sm:text-sm text-espresso-500 leading-relaxed max-w-xl mx-auto">
              Choose from ready-to-ship articulated models, home decor &amp; planters, or turn your personal photos into customized 3D figurines.
            </p>
          </div>

          {/* DUAL PILLARS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* PILLAR 1 CARD: Ready-to-Ship 3D Printed Models */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl bg-white border-2 border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between overflow-hidden group"
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    Option 1: Ready to Ship
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Bambu Lab Multi-Color
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-burgundy-900 group-hover:text-ribbon-600 transition-colors">
                    3D Printed Collections
                  </h2>
                  <p className="text-xs sm:text-sm text-espresso-500 mt-1 leading-relaxed">
                    Explore curated physical 3D models ready for immediate dispatch: multi-jointed articulated dragons, low-poly wildlife, geometric planters, tea light lanterns &amp; mandir idols.
                  </p>
                </div>

                {/* Category Chips Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    🐉 Articulated &amp; Flexi
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    🐾 Animals &amp; Pets
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    🪴 Pots &amp; Planters
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    🕯️ Candle Holders
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-700">
                    🪔 Festive Idols
                  </span>
                </div>
              </div>

              <div className="pt-6 relative z-10 flex items-center justify-between border-t border-slate-100 mt-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pricing</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">Starting at ₹399</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("printed-catalog-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else navigate("/shop");
                  }}
                  className="btn-secondary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
                >
                  <span>Browse Collections</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* PILLAR 2 CARD: Create Personalized 3D Figurine */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative rounded-3xl bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70 border-2 border-rose-300/80 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between overflow-hidden group"
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-200/50 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100/90 border border-rose-300/80 text-ribbon-700 text-[11px] font-bold">
                    <Sparkles size={12} className="text-ribbon-500" />
                    Option 2: Custom Made
                  </span>
                  <span className="text-[11px] font-mono font-bold text-rose-500">
                    Photo to 3D Figurine
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-burgundy-900 group-hover:text-ribbon-600 transition-colors">
                    Personalize 3D Keepsake
                  </h2>
                  <p className="text-xs sm:text-sm text-espresso-500 mt-1 leading-relaxed">
                    Upload your photograph of a couple, child, loved one, or pet. Our studio sculpts a cute stylized chibi 3D figurine with custom base engraving, printed in smooth solid colors.
                  </p>
                </div>

                {/* Key Features Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-semibold text-rose-800 shadow-2xs">
                    📸 Any Portrait Photo
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-semibold text-rose-800 shadow-2xs">
                    ✍️ Engraved Display Stand
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-semibold text-rose-800 shadow-2xs">
                    🎨 Plain Solid Colors (No Patterns)
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-semibold text-rose-800 shadow-2xs">
                    📏 3.5&quot;, 5.5&quot; &amp; 8.0&quot; Sizes
                  </span>
                </div>
              </div>

              <div className="pt-6 relative z-10 flex items-center justify-between border-t border-rose-100 mt-6">
                <div>
                  <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Studio Craft</span>
                  <span className="text-sm font-bold text-rose-900 font-mono">From ₹699 / ₹1,299</span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/personalized")}
                  className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                >
                  <Sparkles size={14} className="text-amber-300" />
                  <span>Personalize Now</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CATEGORY SHOWCASE GRID (Animals, Articulated, Pots, Candle Holders, etc.)
         ========================================================================= */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block mb-1">
                Explore Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-burgundy-900">
                Ready-to-Ship 3D Printed Collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-ribbon-600 hover:text-ribbon-700 flex items-center gap-1 group"
            >
              <span>View Full Catalog</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRINTED_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={cat.to}
                className="group relative rounded-2xl p-5 bg-[#FAF7F5] border border-rose-100/80 hover:border-rose-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {cat.itemCount}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-burgundy-900 group-hover:text-ribbon-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-espresso-400 mt-1 leading-snug">
                    {cat.tagline}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-rose-100/60 flex items-center justify-between text-xs font-bold text-ribbon-600">
                  <span>Browse Category</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FEATURED PRODUCTS GRID (Filterable Tabs for 3D Printed Models)
         ========================================================================= */}
      <section id="printed-catalog-section" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block">
              Curated Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-burgundy-900">
              Featured 3D Printed Models
            </h2>
            <p className="text-xs sm:text-sm text-espresso-400">
              Sliced with calibrated layer heights and printed on industrial multi-color FDM printers.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All Models" },
              { id: "articulated", label: "🐉 Articulated & Flexi" },
              { id: "animals", label: "🐾 Animals & Pets" },
              { id: "pots-planters", label: "🪴 Pots & Planters" },
              { id: "candle-holders", label: "🕯️ Candle Holders" },
              { id: "festival", label: "🪔 Festive Idols" },
              { id: "desk-accessories", label: "📱 Desk Gadgets" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-ribbon-500 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-ribbon-300"
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
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onCustomize={(p) => {
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
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400">No models found in this category yet.</p>
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/shop"
              className="btn-secondary py-3 px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Explore All 3D Printed Creations</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PERSONALIZED 3D STUDIO SPOTLIGHT (How Photo-to-Figurine Works)
         ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-rose-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-rose-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-400" />
              Custom Keepsake Atelier
            </span>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              Turn Any Photograph Into a Physical 3D Figurine
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Upload your photo of a couple, child, or pet. Our studio creates a cute chibi 3D figurine, sculpts your custom engraved base inscription, and prints it in solid, clean colors.
            </p>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-rose-400 font-display font-bold text-xl block">01</span>
                <h4 className="font-bold text-xs text-white mt-1">Upload Photo</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Portrait, couple snap, or favorite pet photo.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-rose-400 font-display font-bold text-xl block">02</span>
                <h4 className="font-bold text-xs text-white mt-1">Base Engraving</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Add names, anniversary dates, or heartfelt text.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-rose-400 font-display font-bold text-xl block">03</span>
                <h4 className="font-bold text-xs text-white mt-1">Precision Print</h4>
                <p className="text-[11px] text-slate-300 mt-0.5">Multi-color FDM printing delivered to doorstep.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/personalized")}
                className="btn-primary py-3.5 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={15} className="text-amber-300" />
                <span>Launch 3D Studio</span>
                <ArrowRight size={15} />
              </button>

              <Link to="/how-it-works" className="text-xs font-semibold text-rose-200 hover:text-white underline">
                How Custom Modeling Works
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-rose-200 pb-3 border-b border-white/15">
                <span className="font-bold flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400" /> Hand-Finished 3D Art
                </span>
                <span>Bambu Lab Sliced</span>
              </div>

              <img
                src="/images/3d-couple-keepsake.webp"
                alt="Personalized 3D Keepsake Preview"
                className="w-full aspect-square rounded-2xl object-cover bg-white/5 border border-white/20 shadow-inner"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-white">
                    Custom 3D Keepsake Figurine
                  </span>
                  <span className="text-rose-300 font-bold text-xs font-mono">From ₹699</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Solid molded plastic aesthetic with integrated standing base platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CRAFTSMANSHIP & TECHNOLOGY TRUST STRIP
         ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
            <Layers size={22} className="text-ribbon-500" />
            <h4 className="font-display font-bold text-sm text-burgundy-900">
              Calibrated Multi-Color FDM
            </h4>
            <p className="text-xs text-espresso-400">
              Printed on high-precision Bambu Lab systems with clean layer bonds.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
            <ShieldCheck size={22} className="text-ribbon-500" />
            <h4 className="font-display font-bold text-sm text-burgundy-900">
              Non-Toxic Bio-PLA Materials
            </h4>
            <p className="text-xs text-espresso-400">
              Odor-free, durable, eco-friendly filaments safe for desktops and home spaces.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center space-y-1.5 shadow-2xs">
            <Truck size={22} className="text-ribbon-500" />
            <h4 className="font-display font-bold text-sm text-burgundy-900">
              Shockproof Pan-India Shipping
            </h4>
            <p className="text-xs text-espresso-400">
              Custom foam-cushioned packaging ensuring your 3D models arrive in mint condition.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. VERIFIED CUSTOMER STORIES
         ========================================================================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-10 bg-[#FAF7F5]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ribbon-600 block">
              Verified Reviews
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-burgundy-900">
              What 3D Enthusiasts Say
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="fill-current" />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">4.9 / 5.0 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-4"
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
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                    &quot;{rev.text}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={rev.img}
                    alt={rev.name}
                    className="h-10 w-10 rounded-full object-cover border border-rose-200"
                  />
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900">{rev.name}</h4>
                    <p className="text-[11px] text-slate-400">{rev.city} • {rev.product}</p>
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
