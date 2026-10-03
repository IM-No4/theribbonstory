import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Truck,
  Star,
  Quote,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Box,
  Layers,
  Camera,
  Gift,
  Smile,
  Users,
  Calendar,
  CheckCircle2,
  Zap,
  Clock,
  Flame,
  Award,
  Lock,
} from "lucide-react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";

// 1. HERO CAROUSEL SLIDES (IGP Style)
const HERO_SLIDES = [
  {
    id: 1,
    tag: "⚡ Same Day & Express Delivery Available",
    title: "Your Memories Deserve More Than a Camera Roll.",
    desc: "Turn your most precious photos into handcrafted 3D keepsakes, crystal acrylic magnets, and luxury curated gift hampers.",
    ctaPrimary: "Create Your Keepsake",
    ctaPrimaryLink: "/personalized",
    ctaSecondary: "Explore Bestsellers",
    ctaSecondaryLink: "/shop",
    bgGradient: "from-rose-50/90 via-white to-pink-50/70",
    badge: "100% Handcrafted",
    img: "/src/assets/images/3d-couple-keepsake.jpeg",
  },
  {
    id: 2,
    tag: "✨ Exclusive 3D Sculptures",
    title: "Turn Love & Moments Into Physical 3D Art.",
    desc: "Bespoke miniature couple casts, adorable pet keepsakes, and family silhouettes handcrafted by master Indian artisans.",
    ctaPrimary: "Explore 3D Keepsakes",
    ctaPrimaryLink: "/3d-keepsakes",
    ctaSecondary: "How It Works",
    ctaSecondaryLink: "/how-it-works",
    bgGradient: "from-purple-50/80 via-white to-rose-50/70",
    badge: "Most Loved Anniversary Gift",
    img: "/src/assets/images/3d-family-keepsake.jpeg",
  },
  {
    id: 3,
    tag: "🎁 Curated Luxury Hampers",
    title: "Unwrap Joy with Hand-Tied Ribbon Gift Boxes.",
    desc: "Elevate your celebrations with custom keepsakes paired with gourmet chocolates, personalized cards, and luxury satin packaging.",
    ctaPrimary: "Shop Luxury Hampers",
    ctaPrimaryLink: "/shop",
    ctaSecondary: "Birthday Gifts",
    ctaSecondaryLink: "/shop?occasion=birthday",
    bgGradient: "from-amber-50/80 via-white to-rose-50/60",
    badge: "Premium Ribbon Unboxing",
    img: "/src/assets/images/luxury-ribbon-hamper.jpeg",
  },
];

// 2. CIRCULAR STORY CATEGORIES (IGP Instagram-Style Chips)
const STORY_CATEGORIES = [
  {
    name: "3D Keepsakes",
    to: "/3d-keepsakes",
    badge: "Hot",
    img: "/src/assets/images/3d-dog-keepsake.jpeg",
  },
  {
    name: "Photo Magnets",
    to: "/shop?category=photo-magnets",
    badge: "Trending",
    img: "/src/assets/images/photo-magnet.jpeg",
  },
  {
    name: "Polaroid Art",
    to: "/shop?category=polaroid-magnets",
    badge: "Best Value",
    img: "/src/assets/images/polaroid-art.jpeg",
  },
  {
    name: "Birthday Gifts",
    to: "/shop?occasion=birthday",
    img: "/src/assets/images/birthday-magnet.jpeg",
  },
  {
    name: "Anniversary",
    to: "/shop?occasion=anniversary",
    img: "/src/assets/images/anniversary.jpeg",
  },
  {
    name: "For Couples",
    to: "/shop?occasion=couples",
    img: "/src/assets/images/for-couples.jpeg",
  },
  {
    name: "Pet Keepsakes",
    to: "/3d-keepsakes",
    img: "/src/assets/images/pet-keepsake.jpeg",
  },
  {
    name: "Under ₹499",
    to: "/shop?maxPrice=499",
    badge: "Budget",
    img: "/src/assets/images/under-499.jpeg",
  },
  {
    name: "⚡ Same Day",
    to: "/shop?tag=express",
    badge: "Fast",
    img: "/src/assets/images/same-day-delivery.jpeg",
  },
];

// 3. GIFTS BY RELATION / RECIPIENT
const RECIPIENTS = [
  {
    id: "for-her",
    title: "Gifts For Her",
    subtitle: "Wife, Girlfriend, Sister, Mom",
    img: "/src/assets/images/gifts-for-her.jpeg",
    to: "/shop?tag=for-her",
    tag: "300+ Gifts",
  },
  {
    id: "for-him",
    title: "Gifts For Him",
    subtitle: "Husband, Boyfriend, Dad, Brother",
    img: "/src/assets/images/gifts-for-him.jpeg",
    to: "/shop?tag=for-him",
    tag: "250+ Gifts",
  },
  {
    id: "for-couples",
    title: "For Couples",
    subtitle: "Romantic & Keepsake Sets",
    img: "/src/assets/images/gifts-for-couples.jpeg",
    to: "/shop?occasion=couples",
    tag: "Most Loved",
  },
  {
    id: "for-friends",
    title: "For Best Friends",
    subtitle: "Funny, Nostalgic & Memory Packs",
    img: "/src/assets/images/gifts-for-friends.jpeg",
    to: "/shop?occasion=friendship",
    tag: "Pack Deals",
  },
  {
    id: "for-parents",
    title: "For Parents",
    subtitle: "Cherished Family Moments",
    img: "/src/assets/images/gifts-for-parents.jpeg",
    to: "/shop?tag=for-parents",
    tag: "Heartwarming",
  },
  {
    id: "for-pets",
    title: "For Pet Parents",
    subtitle: "Custom 3D Cat & Dog Figurines",
    img: "/src/assets/images/3d-dog-keepsake.jpeg",
    to: "/3d-keepsakes",
    tag: "Bespoke Art",
  },
];

// 4. CELEBRATE OCCASIONS
const OCCASIONS = [
  {
    title: "Birthday",
    subtitle: "Celebrate another milestone year",
    img: "/src/assets/images/gifts-for-birthday.jpeg",
    to: "/shop?occasion=birthday",
  },
  {
    title: "Anniversary",
    subtitle: "Reminisce every beautiful year together",
    img: "/src/assets/images/gifts-for-anniversary.jpeg",
    to: "/shop?occasion=anniversary",
  },
  {
    title: "Wedding",
    subtitle: "Pre-wedding & marriage keepsakes",
    img: "/src/assets/images/gifts-for-wedding.jpeg",
    to: "/shop?occasion=wedding",
  },
  {
    title: "Housewarming",
    subtitle: "Make a new house feel like home",
    img: "/src/assets/images/gifts-for-housewarming.jpeg",
    to: "/shop?occasion=housewarming",
  },
];

// 5. CUSTOMER STORIES & VERIFIED REVIEWS
const REVIEWS = [
  {
    name: "Riya Sharma",
    city: "Mumbai",
    rating: 5,
    product: "3D Pet Miniature Magnet",
    text: "Ordered a 3D sculpt of our Golden Retriever Bruno for my sister's birthday. The detailing on the fur and expression blew us away! Arrived in a luxury ribbon box.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    name: "Kabir Malhotra",
    city: "Bengaluru",
    rating: 5,
    product: "Polaroid Memory Magnet Set",
    text: "The vintage white polaroid frame magnet turned our anniversary trip photos into our fridge's favorite centerpiece. Superb gloss and scratch resistance.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    name: "Ananya Patel",
    city: "Delhi NCR",
    rating: 5,
    product: "3D Couple Cast Keepsake",
    text: "Ordered for our 1st wedding anniversary. Everyone who visits our living room asks where we got it made. The Ribbon Story is our new go-to gifting brand!",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  // Auto carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Fetch all products and dynamic collections
  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/products"),
      api.get("/categories"),
    ])
      .then(([prodRes, catRes]) => {
        if (!active) return;
        setProducts(prodRes.data?.products || []);
        if (catRes.data?.categories?.length > 0) {
          setCategories(catRes.data.categories);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Computed Story Categories: DB collections or fallback
  const displayStoryCategories = categories.length > 0
    ? categories.map((c) => ({
        name: c.name,
        to: c.slug === "3d-keepsakes" ? "/3d-keepsakes" : `/shop?category=${c.slug}`,
        badge: c.badge || "",
        img: c.image || "/src/assets/images/photo-magnet.jpeg",
      }))
    : STORY_CATEGORIES;

  // Filter products for tabbed bestsellers
  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return true;
    if (activeTab === "3d") return p.category === "3d-keepsakes";
    if (activeTab === "photo") return p.category === "photo-magnets" || p.category === "polaroid-magnets";
    if (activeTab === "budget") return p.price <= 499;
    return p.category === activeTab;
  });

  return (
    <div className="space-y-0 overflow-hidden bg-white">
      {/* 1. CIRCULAR STORY CATEGORY CHIPS BAR (IGP Style) */}
      <section className="bg-white border-b border-slate-100 py-4 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-start lg:justify-between gap-4 sm:gap-6 lg:gap-2 overflow-x-auto no-scrollbar py-1">
          {displayStoryCategories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.to}
              className="flex flex-col items-center gap-1.5 shrink-0 lg:flex-1 lg:max-w-[110px] group text-center"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-coral-500 via-ribbon-500 to-ribbon-700 group-hover:scale-105 transition-transform duration-200">
                <div className="p-0.5 bg-white rounded-full">
                  <img
                    src={cat.img?.startsWith("http") || cat.img?.startsWith("/src") ? cat.img : `http://localhost:5000${cat.img}`}
                    alt={cat.name}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/src/assets/images/photo-magnet.jpeg";
                    }}
                  />
                </div>
                {cat.badge && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-ribbon-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter whitespace-nowrap shadow-xs">
                    {cat.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-ribbon-600 transition-colors whitespace-nowrap max-w-[85px] truncate">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. HERO PROMOTIONAL BANNER CAROUSEL (IGP Style) */}
      <section className="relative overflow-hidden bg-slate-100/75 py-6 sm:py-10 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-slate-300/50 border border-slate-200 bg-white ring-1 ring-black/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className={`p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient}`}
              >
                {/* Left Text */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-ribbon-600 font-bold text-xs shadow-xs border border-rose-200">
                    <Sparkles size={13} className="text-ribbon-500" />
                    {HERO_SLIDES[currentSlide].tag}
                  </span>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 leading-[1.15]">
                    {HERO_SLIDES[currentSlide].title}
                  </h1>

                  <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
                    {HERO_SLIDES[currentSlide].desc}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      to={HERO_SLIDES[currentSlide].ctaPrimaryLink}
                      className="btn-primary py-3.5 px-7 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-soft"
                    >
                      <span>{HERO_SLIDES[currentSlide].ctaPrimary}</span>
                      <ArrowRight size={16} />
                    </Link>

                    <Link
                      to={HERO_SLIDES[currentSlide].ctaSecondaryLink}
                      className="btn-outline py-3.5 px-7 text-xs sm:text-sm font-bold uppercase tracking-wider"
                    >
                      {HERO_SLIDES[currentSlide].ctaSecondary}
                    </Link>
                  </div>

                  {/* Delivery Assurance in Hero */}
                  <div className="pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Truck size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      🚚 Pan-India Express Delivery <span className="text-slate-500 font-normal">(29,000+ Pincodes)</span> — Earliest delivery: <strong className="text-emerald-700 font-bold">Tomorrow</strong>
                    </span>
                  </div>
                </div>

                {/* Right Image Composition */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-sm aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <img
                      src={HERO_SLIDES[currentSlide].img}
                      alt={HERO_SLIDES[currentSlide].title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs border border-slate-200">
                      {HERO_SLIDES[currentSlide].badge}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation Arrows */}
            <button
              onClick={() =>
                setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))
              }
              aria-label="Previous Slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-card flex items-center justify-center transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next Slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-card flex items-center justify-center transition"
            >
              <ChevronRight size={20} />
            </button>

            {/* Carousel Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-7 bg-ribbon-500" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & ASSURANCE STRIP (IGP Style) */}
      <section className="bg-slate-50/60 border-b border-slate-100 py-6 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Same Day Delivery</h4>
              <p className="text-[11px] text-slate-500">Available across 50+ Indian cities</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-rose-50 text-ribbon-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">100% Handcrafted</h4>
              <p className="text-[11px] text-slate-500">Custom made from your photos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Star size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">4.9★ Rated Gifting</h4>
              <p className="text-[11px] text-slate-500">Loved by 25,000+ happy customers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">Luxe Ribbon Box</h4>
              <p className="text-[11px] text-slate-500">Ready to gift in premium packaging</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FIND GIFTS BY RELATION / RECIPIENT (IGP Style Grid) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">Personalized for Everyone</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 mt-1">
                Find Gifts by Recipient
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Thoughtfully crafted keepsakes matched to every bond and relationship.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ribbon-500 hover:text-ribbon-600"
            >
              <span>View All Recipients</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {RECIPIENTS.map((rec) => (
              <Link
                key={rec.id}
                to={rec.to}
                className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-ribbon-400 hover:shadow-hover transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden bg-slate-100">
                  <img
                    src={rec.img}
                    alt={rec.title}
                    className="h-72 w-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-900 px-2 py-0.5 rounded-md">
                    {rec.tag}
                  </span>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                    <h3 className="font-display font-bold text-sm leading-tight group-hover:text-rose-200 transition">
                      {rec.title}
                    </h3>
                    <p className="text-[10px] text-slate-200/90 line-clamp-1 mt-0.5">{rec.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TABBED BESTSELLERS & TRENDING SHOWCASE (IGP Style) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="section-eyebrow">Top Loved Keepsakes</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900 mt-1">
                Trending &amp; Best Selling Gifts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Handcrafted favorites ordered by 10,000+ gift-givers this month.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 overflow-x-auto no-scrollbar shadow-xs">
              {[
                { id: "all", label: "All Bestsellers" },
                { id: "3d", label: "3D Sculptures" },
                { id: "photo", label: "Photo Magnets" },
                { id: "budget", label: "Under ₹499" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-ribbon-500 text-white shadow-xs"
                      : "text-slate-600 hover:text-ribbon-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.slice(0, 8).map((product, idx) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  index={idx}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onPersonalize={(p) => navigate(`/product/${p.slug}`)}
                />
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              to="/shop"
              className="btn-primary py-3.5 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider"
            >
              View Full Collection ({products.length} Keepsakes)
            </Link>
          </div>
        </div>
      </section>

      {/* 5.5. BESPOKE HAMPER BUILDER SPOTLIGHT BANNER */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-burgundy-900 via-burgundy-950 to-slate-950 text-white relative overflow-hidden">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-ribbon-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-rose-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-amber-400" />
              <span>Interactive Hamper Studio</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              Build a Custom Gift Hamper in 4 Simple Steps.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Select your luxury keepsake box, pick your favorite photo memory or 3D miniature, add handcrafted chocolates &amp; treats, and write a heartfelt personal message. We tie it with our signature satin ribbon.
            </p>

            {/* 4 Interactive Process Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { step: "01", title: "Box & Ribbon", desc: "Luxury finish & satin knot", icon: Box },
                { step: "02", title: "Keepsake", desc: "3D sculpt or photo magnet", icon: Camera },
                { step: "03", title: "Treats & Extras", desc: "Truffles, candle, lights", icon: Gift },
                { step: "04", title: "Greeting Card", desc: "Printed heartfelt note", icon: Heart },
              ].map((st, sIdx) => {
                const IconComponent = st.icon;
                return (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 hover:bg-white/15 transition group"
                  >
                    <div className="flex items-center justify-between text-rose-300 mb-2">
                      <span className="font-mono text-xs font-bold">{st.step}</span>
                      <IconComponent size={16} className="text-amber-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="font-bold text-xs text-white leading-tight">{st.title}</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">{st.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => navigate("/build-a-box")}
                className="btn-primary py-3.5 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-rose-950/50"
              >
                <Gift size={16} />
                <span>Start Building Your Hamper</span>
                <ArrowRight size={16} />
              </button>

              <Link
                to="/shop?category=hampers"
                className="text-xs sm:text-sm font-semibold text-rose-200 hover:text-white underline transition"
              >
                Or Explore Pre-Curated Hampers
              </Link>
            </div>
          </div>

          {/* Right Image / Virtual Hamper Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-md p-5 border border-white/20 shadow-2xl space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80"
                  alt="Custom Gift Hamper Unboxing"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-ribbon-500 text-white">
                    Signature Keepsake Box
                  </span>
                  <h4 className="font-display font-bold text-lg text-white mt-1">
                    The Forever Memory Hamper
                  </h4>
                  <p className="text-xs text-slate-200">
                    Hand-assembled with double-faced satin ribbon &amp; sealed wax seal.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-200 px-2">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <ShieldCheck size={14} /> Damage-Proof Safe Transit
                </span>
                <span className="font-bold text-white">From ₹849</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CELEBRATE BY OCCASION (IGP Style Banners) */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="section-eyebrow">Milestones That Matter</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900">
              Celebrate Every Special Occasion
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              No matter the milestone, make it unforgettable with a personalized memory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {OCCASIONS.map((occ, idx) => (
              <Link
                key={idx}
                to={occ.to}
                className="group relative rounded-3xl overflow-hidden bg-white shadow-card border border-slate-200 hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={occ.img}
                    alt={occ.title}
                    className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                </div>
                <div className="p-4 bg-white flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-ribbon-600 transition">
                      {occ.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{occ.subtitle}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-rose-50 text-ribbon-600 flex items-center justify-center group-hover:bg-ribbon-500 group-hover:text-white transition">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOM KEEPSAKE STUDIO WALKTHROUGH */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-rose-200 font-bold text-xs border border-white/15">
              <Sparkles size={13} className="text-amber-400" />
              Interactive Keepsake Studio
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight">
              You Give Us a Memory. We Turn It Into Something You Can Hold.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              No generic gifts. Upload your favorite candid photo, choose custom frames or 3D sculpt styles, add meaningful dates or text, and watch our master artisans hand-finish it into an heirloom keepsake.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-rose-400 font-display font-bold text-2xl">01</span>
                <h4 className="font-bold text-sm text-white mt-1">Upload Any Photo</h4>
                <p className="text-xs text-slate-300 mt-0.5">Phone snaps, studio portraits, or retro memories.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-rose-400 font-display font-bold text-2xl">02</span>
                <h4 className="font-bold text-sm text-white mt-1">Select Custom Style</h4>
                <p className="text-xs text-slate-300 mt-0.5">3D sculpture, crystal acrylic, or polaroid border.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => navigate("/personalized")}
                className="btn-primary py-3.5 px-8 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg"
              >
                <span>Launch Custom Studio</span>
                <ArrowRight size={16} />
              </button>

              <Link to="/how-it-works" className="text-xs font-semibold text-slate-300 hover:text-white underline">
                Watch Process Video
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-rose-200 pb-3 border-b border-white/15">
                <span className="font-bold flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400" /> Artisan Hand-Crafted
                </span>
                <span>Fast Dispatches</span>
              </div>

              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80"
                alt="Personalized Studio"
                className="w-full h-56 rounded-2xl object-cover border border-white/20 shadow-inner"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-base text-white">
                    Personalized Ribbon Keepsake Box
                  </span>
                  <span className="text-rose-300 font-bold text-sm">From ₹349</span>
                </div>
                <p className="text-xs text-slate-300">
                  Includes scratch-resistant acrylic, strong neodymium magnet, and satin ribbon packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VERIFIED CUSTOMER REVIEWS & PHOTO WALL */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-10 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="section-eyebrow">Happy Tear Moments</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-slate-900">
              Loved by 25,000+ Customers Across India
            </h2>
            <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} className="fill-current" />
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">4.9 / 5.0 Overall Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, rIdx) => (
                        <Star key={rIdx} size={14} className="fill-current" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={rev.img}
                    alt={rev.name}
                    className="h-11 w-11 rounded-full object-cover border border-rose-300"
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
          setSelectedProduct(p);
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
