import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Heart,
  Camera,
  Palette,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { api, assetUrl } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import { useSeo } from "../utils/seo";
import { useConfigStore } from "../store/configStore";
import { HERO_PRESETS } from "../data/heroPresets";

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
    tagline: "A little version of you",
    description: "A personalized character inspired by your photo.",
    image: "/images/3d-single-keepsake.jpg",
    pricingOptions: [{ price: 699, dimensions: '3.5" (9 cm)' }],
  },
  {
    name: "Couple",
    slug: "couple",
    icon: "💞",
    tagline: "For your favourite person",
    description: "A custom couple keepsake for anniversaries and special moments.",
    image: "/images/3d-couple-keepsake.webp",
    pricingOptions: [{ price: 1499, dimensions: '5.0" (13 cm)' }],
    isPopular: true,
  },
  {
    name: "Family",
    slug: "family",
    icon: "👨‍👩‍👧",
    tagline: "Keep your people close",
    description: "A family keepsake made to celebrate the people who matter.",
    image: "/images/3d-family-keepsake.webp",
    pricingOptions: [{ price: 2499, dimensions: '5.5" (14 cm)' }],
  },
  {
    name: "Kid & Baby",
    slug: "kid",
    icon: "🧸",
    tagline: "Little milestones",
    description: "Mark a birthday, a milestone or a moment worth remembering.",
    image: "/images/3d-kid-keepsake.jpg",
    pricingOptions: [{ price: 649, dimensions: '3.5" (9 cm)' }],
  },
  {
    name: "Pet",
    slug: "pet",
    icon: "🐾",
    tagline: "Your furry family",
    description: "A personalized keepsake inspired by your beloved companion.",
    image: "/images/3d-dog-keepsake.webp",
    pricingOptions: [{ price: 699, dimensions: '3.5" (9 cm)' }],
  },
];

const TRUST_ITEMS = [
  {
    custom: true,
    icon: Camera,
    title: "Made from your photo",
    description: "Personalized figurines created to order from your reference photo.",
  },
  {
    icon: Palette,
    title: "Thoughtful designs",
    description: "Cute characters and considered details, made for display and gifting.",
  },
  {
    icon: PackageCheck,
    title: "Packed with care",
    description: "We take care when preparing your keepsake for its journey to you.",
  },
  {
    icon: Heart,
    title: "Made to be kept",
    description: "Small objects that celebrate people, pets and everyday moments.",
  },
];

/**
 * Interleaves products across collections in a round-robin order so the "All products"
 * view displays a diverse, balanced mix rather than clumped items from one collection.
 */
function mixProductsByCollection(products, categories = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const groups = new Map();

  // Pre-seed groups in categories order so collections are traversed in configured sequence
  if (Array.isArray(categories) && categories.length > 0) {
    for (const cat of categories) {
      if (cat?.slug) groups.set(cat.slug, []);
    }
  }

  // Populate products into their respective category bucket
  for (const product of products) {
    const cat = product.category || "other";
    if (!groups.has(cat)) {
      groups.set(cat, []);
    }
    groups.get(cat).push(product);
  }

  // Interleave round-robin across every category bucket
  const mixed = [];
  const activeLists = Array.from(groups.values()).filter((list) => list.length > 0);
  let round = 0;
  let addedInRound = true;

  while (addedInRound) {
    addedInRound = false;
    for (const list of activeLists) {
      if (round < list.length) {
        mixed.push(list[round]);
        addedInRound = true;
      }
    }
    round++;
  }

  return mixed;
}

function SectionHeading({ eyebrow, title, description, action, light }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-2 ${light ? "text-red-100" : "text-ribbon-600"}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight ${light ? "text-white" : "text-stone-900"}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-sm sm:text-base leading-relaxed ${light ? "text-white/85" : "text-stone-600"}`}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  useSeo({ path: "/" });
  const customKeepsakesEnabled = useConfigStore((s) => s.config.customKeepsakesEnabled !== false);
  const heroTheme = useConfigStore((s) => s.config.heroTheme);
  const accent = (HERO_PRESETS[heroTheme?.preset] || HERO_PRESETS.custom).accent;
  const heroImages = heroTheme?.images?.length ? heroTheme.images.map((u) => assetUrl(u)) : ["/images/keepsake-3d.jpeg"];
  const heroMobileImages = heroTheme?.mobileImages?.length ? heroTheme.mobileImages.map((u) => assetUrl(u)) : null;
  const themedHero = Boolean(heroTheme?.images?.length || heroMobileImages);
  const heroSlides = Math.max(heroImages.length, heroMobileImages?.length || 0);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (Math.max(heroImages.length, heroMobileImages?.length || 0) < 2) return undefined;
    const timer = setInterval(() => setHeroIndex((i) => i + 1), 4500);
    return () => clearInterval(timer);
  }, [heroImages.length, heroMobileImages?.length]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllCollections, setShowAllCollections] = useState(false);
  const [keepsakeCategories, setKeepsakeCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const navigate = useNavigate();

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
        if (keepsakeRes.data?.categories?.length) {
          setKeepsakeCategories(keepsakeRes.data.categories);
        }
      })
      .catch((err) => {
        console.error("Error fetching homepage data:", err);
      })
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

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") {
      return mixProductsByCollection(products, categories);
    }
    return products.filter((product) => product.category === activeTab);
  }, [products, categories, activeTab]);

  const keepsakeCards =
    keepsakeCategories.length > 0 ? keepsakeCategories : DEFAULT_KEEPSAKE_CARDS;

  const openProductCustomizer = (product) => {
    if (
      product.category === "personalized-3d" ||
      product.slug === "custom-3d-keepsake-figurine"
    ) {
      if (customKeepsakesEnabled) navigate("/personalized");
    } else {
      setSelectedProduct(product);
    }
  };

  const pageBg = themedHero && heroTheme?.pageBackground ? assetUrl(heroTheme.pageBackground) : null;
  const categoryAction = (title) => (
    <Link
      to="/shop"
      className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${pageBg ? "text-white hover:text-red-100" : "text-ribbon-600 hover:text-ribbon-700"}`}
    >
      {title} <ArrowRight size={16} />
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#FBF8F4] text-stone-800">
      {heroTheme?.bannerText && (
        <div className={`px-4 py-2 text-center text-xs font-semibold sm:text-sm ${accent.banner}`}>
          {heroTheme.bannerText}
        </div>
      )}

      <div
        className={pageBg ? "bg-red-800" : undefined}
        style={pageBg ? { backgroundImage: `url("${pageBg}")`, backgroundSize: "min(100vw, 800px) auto", backgroundRepeat: "repeat" } : undefined}
      >
      {/* HERO */}
      <section className={`relative isolate overflow-hidden ${themedHero ? "" : "border-b border-stone-200/70 bg-[#F8F1E9]"}`}>
        {themedHero ? (
          <div
            className="absolute inset-0 -z-10"
            style={pageBg ? { WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 7rem), transparent)", maskImage: "linear-gradient(to bottom, #000 calc(100% - 7rem), transparent)" } : undefined}
          >
            <picture key={heroIndex}>
              {heroMobileImages && (
                <source media="(max-width: 639px)" srcSet={heroMobileImages[heroIndex % heroMobileImages.length]} />
              )}
              <img
                src={heroImages[heroIndex % heroImages.length]}
                alt=""
                className="h-full w-full object-cover object-center"
                onError={(event) => {
                  event.currentTarget.src = "/images/photo-magnet.webp";
                }}
              />
            </picture>
            {heroSlides > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {Array.from({ length: heroSlides }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full bg-white transition-all ${i === heroIndex % heroSlides ? "w-4" : "w-1.5 opacity-60"}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/studio-bg.jpg"
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FBF6EF]/95 via-[#FBF6EF]/85 to-[#FBF6EF]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FBF8F4]/65 via-transparent to-white/10" />
          <div className={`absolute -right-24 top-1/4 h-72 w-72 sm:h-96 sm:w-96 rounded-full blur-3xl ${accent.glow}`} />
        </div>
        )}

        <div className={`mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-10 lg:gap-12 lg:px-8 lg:py-16 xl:py-20 ${themedHero ? "min-h-[calc(100svh-6.5rem)] content-start pt-20 sm:min-h-[560px] sm:content-center sm:pt-12 sm:py-12 lg:min-h-[640px]" : "lg:grid-cols-2"}`}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className={`max-w-2xl ${themedHero ? "" : "order-2 lg:order-1"}`}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-700 shadow-sm sm:text-xs">
              <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
              {heroTheme?.badge || "Little things. Big meaning."}
            </div>

            <h1 className={`max-w-xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl xl:text-6xl ${themedHero ? "text-stone-900" : "text-stone-900"}`}>
              {heroTheme?.headline || "Your Memories,"}
              <span className={`block ${themedHero ? accent.highlight : accent.highlight}`}>
                {heroTheme?.highlight || (heroTheme?.headline ? "" : "Made to Keep.")}
              </span>
            </h1>

            <p className={`mt-5 max-w-xl text-sm leading-6 sm:text-base sm:leading-7 ${themedHero ? "hidden text-stone-700 sm:block" : "text-stone-600"}`}>
              {heroTheme?.subtext ||
                (customKeepsakesEnabled
                  ? "Discover cute 3D-printed collectibles for your desk and home, or turn your favourite photo into a personalized figurine made just for you."
                  : "Discover cute 3D-printed collectibles for your desk and home, made to be kept and gifted.")}
            </p>

            {themedHero && heroTheme?.overlayText && (
              <p className="mt-3 hidden max-w-xl text-base font-bold text-stone-900 sm:block sm:text-lg">{heroTheme.overlayText}</p>
            )}

            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              {heroTheme?.ctaText && (
                <Link
                  to={heroTheme.ctaLink || "/shop"}
                  className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-md transition hover:shadow-lg"
                >
                  <Sparkles size={16} />
                  {heroTheme.ctaText}
                  <ArrowRight size={15} />
                </Link>
              )}
              {customKeepsakesEnabled && (
              <Link
                to="/personalized"
                className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-md transition hover:shadow-lg"
              >
                <Sparkles size={16} />
                Create Your Figurine
                <ArrowRight size={15} />
              </Link>
              )}
              <Link
                to="/shop"
                className={`min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white/90 px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-ribbon-300 hover:bg-white ${themedHero ? "hidden sm:inline-flex" : "inline-flex"}`}
              >
                <ShoppingBag size={16} />
                Shop Collectibles
              </Link>
            </div>

            {!themedHero && (
            <div className="mt-6 grid grid-cols-1 gap-2 border-t border-stone-300/70 pt-5 min-[420px]:grid-cols-2">
              {[
                ...(customKeepsakesEnabled ? ["Personalized figurines made to order"] : []),
                "Cute collectibles for desks and homes",
                "Thoughtful little gifts",
                "Designed to make everyday moments special",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs sm:text-sm text-stone-600">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ribbon-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            )}
          </motion.div>

          {!themedHero && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="order-1 mx-auto w-full max-w-xl lg:order-2"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-2 shadow-[0_24px_70px_-28px_rgba(70,45,35,0.35)] sm:p-3">
              <div className={`relative overflow-hidden rounded-[1.25rem] bg-[#F7F0E8] sm:aspect-[5/4] ${heroMobileImages ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                <picture key={heroIndex}>
                  {heroMobileImages && (
                    <source media="(max-width: 639px)" srcSet={heroMobileImages[heroIndex % heroMobileImages.length]} />
                  )}
                <img
                  src={heroImages[heroIndex % heroImages.length]}
                  alt={heroTheme?.headline || (customKeepsakesEnabled ? "Personalized 3D-printed figurine" : "3D-printed collectible")}
                  className={`h-full w-full object-center ${heroTheme?.images?.length || heroMobileImages ? "object-cover" : "object-contain"}`}
                  onError={(event) => {
                    event.currentTarget.src = "/images/photo-magnet.webp";
                  }}
                />
                </picture>

                {heroSlides > 1 && (
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    {Array.from({ length: heroSlides }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full bg-white transition-all ${i === heroIndex % heroSlides ? "w-4" : "w-1.5 opacity-60"}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/75 via-stone-950/25 to-transparent p-4 pt-16 sm:p-6 sm:pt-20">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur sm:text-xs">
                    <Sparkles size={13} />
                    {heroTheme?.badge || (customKeepsakesEnabled ? "Made personal, made to keep" : "Cute collectibles, made to keep")}
                  </span>

                  <p className="mt-2 max-w-sm text-lg font-bold leading-snug text-white sm:text-2xl">
                    {heroTheme?.overlayText || (customKeepsakesEnabled ? "A favourite moment, turned into a keepsake." : "Little things that bring big smiles.")}
                  </p>
                </div>
              </div>
              {customKeepsakesEnabled && !heroTheme && (
              <div className="grid grid-cols-3 gap-2 px-1 pb-1 pt-3 sm:gap-3 sm:px-2 sm:pb-2">
                <div className="rounded-xl bg-[#FBF6EF] px-2 py-3 text-center">
                  <Camera size={17} className="mx-auto text-ribbon-600" />
                  <p className="mt-1.5 text-[10px] font-semibold text-stone-700 sm:text-xs">Your photo</p>
                </div>
                <div className="rounded-xl bg-[#FBF6EF] px-2 py-3 text-center">
                  <Sparkles size={17} className="mx-auto text-ribbon-600" />
                  <p className="mt-1.5 text-[10px] font-semibold text-stone-700 sm:text-xs">Custom design</p>
                </div>
                <div className="rounded-xl bg-[#FBF6EF] px-2 py-3 text-center">
                  <Heart size={17} className="mx-auto text-ribbon-600" />
                  <p className="mt-1.5 text-[10px] font-semibold text-stone-700 sm:text-xs">Your keepsake</p>
                </div>
              </div>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className={`${pageBg ? "" : "border-b border-stone-200/70 bg-white"} px-4 sm:px-6 lg:px-8 xl:px-12 ${pageBg ? "py-5 sm:py-8" : "py-12 sm:py-16"}`}>
        <div className="mx-auto max-w-[1536px] space-y-6 sm:space-y-8">
          <SectionHeading
            light={Boolean(pageBg)}
            eyebrow="Find your kind of little thing"
            title="Shop by Collection"
            description="From tiny desk companions to thoughtful home accents, find something that feels like you."
            action={categoryAction("Browse all collections")}
          />

          {loadingCategories ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5].map((item, idx) => (
                <div
                  key={item}
                  className={`aspect-[4/5] animate-pulse rounded-2xl bg-stone-100 sm:aspect-[4/3] ${
                    idx >= 4 ? "hidden sm:block" : ""
                  }`}
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                {(showAllCollections ? categories : categories.slice(0, 5)).map((category, idx) => (
                  <Link
                    key={category._id || category.slug}
                    to={`/shop?category=${category.slug}`}
                    className={`group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-[#FBF8F4] transition duration-300 hover:-translate-y-1 hover:border-ribbon-300 hover:shadow-lg ${
                      idx >= 4 ? "hidden sm:flex" : ""
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                      <img
                        src={assetUrl(category.image || "/images/photo-magnet.webp")}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = "/images/photo-magnet.webp";
                        }}
                      />
                      {category.badge && (
                        <span className="absolute left-2 top-2 rounded-full bg-ribbon-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-[10px]">
                          {category.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                      <div>
                        <h3 className="font-display text-sm font-bold text-stone-900 transition-colors group-hover:text-ribbon-600 sm:text-base line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-stone-600 sm:text-xs">
                          {category.description || "Explore this collection of 3D-printed creations."}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-stone-200/80 pt-2.5 text-[10px] font-bold text-ribbon-600 sm:text-xs">
                        <span>
                          {typeof category.productCount === "number" && category.productCount > 0
                            ? `${category.productCount} products`
                            : "Explore collection"}
                        </span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-[#FBF8F4] p-8 text-center">
              <p className="text-sm text-stone-600">Collections will appear here soon.</p>
              <Link to="/shop" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ribbon-600">
                Browse the shop <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={`px-4 sm:px-6 lg:px-8 xl:px-12 ${pageBg ? "py-5 sm:py-8" : "py-12 sm:py-16 lg:py-20"}`}>
        <div className="mx-auto max-w-[1536px] space-y-7 sm:space-y-9">
          <SectionHeading
            light={Boolean(pageBg)}
            eyebrow="Small things, big personality"
            title="Little Things Worth Keeping"
            description="Explore our ready-to-buy 3D-printed pieces for desks, shelves, refrigerators and thoughtful gifting."
            action={categoryAction("Explore all products")}
          />

          <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1 no-scrollbar">
            {[
              { id: "all", label: "All products" },
              ...categories.map((category) => ({
                id: category.slug,
                label: category.name,
              })),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-10 shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                  activeTab === tab.id
                    ? "bg-ribbon-600 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-700 hover:border-ribbon-300 hover:text-ribbon-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                <div
                  key={item}
                  className="aspect-[3/4] animate-pulse rounded-2xl border border-stone-200 bg-white"
                />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {filteredProducts.slice(0, 10).map((product, index) => (
                <ProductCard
                  key={product._id || product.slug}
                  product={product}
                  index={index}
                  onQuickView={(item) => setQuickViewProduct(item)}
                  onPersonalize={openProductCustomizer}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center">
              <ShoppingBag size={28} className="mx-auto text-stone-400" />
              <p className="mt-3 text-sm font-semibold text-stone-700">No products in this collection yet.</p>
              <p className="mt-1 text-xs text-stone-500">Try another collection or browse all products.</p>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-4 text-sm font-semibold text-ribbon-600"
              >
                Show all products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PERSONALIZED FIGURINES */}
      {customKeepsakesEnabled && (
      <section className="relative overflow-hidden bg-[#292321] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* Header & Value Highlights */}
          <div className="mb-8 text-left lg:mx-auto lg:mb-12 lg:max-w-3xl lg:text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-200 sm:text-xs">
              <Sparkles size={14} />
              Made just for you
            </span>

            <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
              Turn a Favourite Photo Into a Little Keepsake.
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-stone-300 sm:text-base lg:mx-auto lg:max-w-2xl">
              Choose a figurine type, share your reference photo and create a personalized piece for a birthday, anniversary, family memory or a gift that feels truly personal.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 sm:gap-3 lg:justify-center">
              {[
                "Choose a single, couple, family, child or pet design",
                "Review available sizes and pricing before ordering",
                "Each figurine is made to order from your selected details",
              ].map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-stone-200 backdrop-blur-sm"
                >
                  <CheckCircle2 size={15} className="shrink-0 text-rose-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 lg:justify-center">
              <Link
                to="/personalized"
                className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition hover:shadow-xl"
              >
                <Sparkles size={16} />
                Create Your Figurine
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Keepsake Cards Grid (2-cols on mobile, 5-cols across desktop) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {keepsakeCards.map((category) => {
              const rawImage =
                category.image ||
                KEEPSAKE_CATEGORY_IMAGES[category.slug] ||
                "/images/3d-single-keepsake.jpg";
              const imageSrc = assetUrl(rawImage);
              const prices = (category.pricingOptions || [])
                .map((option) => Number(option.price))
                .filter((price) => Number.isFinite(price) && price > 0);
              const startingPrice = prices.length ? Math.min(...prices) : null;

              return (
                <Link
                  key={category._id || category.slug}
                  to={`/personalized?category=${category.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] transition duration-300 hover:-translate-y-1 hover:border-rose-300/60 hover:bg-white/[0.1] hover:shadow-xl last:col-span-2 lg:last:col-span-1 sm:rounded-3xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-800">
                    <img
                      src={imageSrc}
                      alt={`${category.name} personalized figurine example`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = "/images/3d-single-keepsake.jpg";
                      }}
                    />
                    {category.isPopular && (
                      <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white sm:left-3 sm:top-3">
                        Popular choice
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                    <div>
                      <h3 className="font-display text-sm font-bold text-white group-hover:text-rose-200 sm:text-base">
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name}
                      </h3>
                      {category.tagline && (
                        <p className="mt-1 text-[11px] font-medium text-rose-200 sm:text-xs">
                          {category.tagline}
                        </p>
                      )}
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-stone-300 sm:text-xs">
                        {category.description || "A personalized keepsake made from your photo."}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <div>
                        {startingPrice !== null ? (
                          <>
                            <span className="block text-[9px] uppercase tracking-wide text-stone-400 sm:text-[10px]">
                              Starting at
                            </span>
                            <span className="text-sm font-bold text-white sm:text-base">
                              ₹{startingPrice.toLocaleString("en-IN")}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-stone-200">View options</span>
                        )}
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-rose-200 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* BRAND BENEFITS */}
      <section className={`${pageBg ? "" : "border-b border-stone-200/70 bg-white"} px-4 sm:px-6 lg:px-8 ${pageBg ? "py-5 sm:py-8" : "py-12 sm:py-16"}`}>
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${pageBg ? "text-red-100" : "text-ribbon-600"}`}>
              The Ribbon Story touch
            </p>
            <h2 className={`mt-2 font-display text-2xl font-bold sm:text-3xl ${pageBg ? "text-white" : "text-stone-900"}`}>
              Little Details. Lots of Meaning.
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${pageBg ? "text-white/85" : "text-stone-600"}`}>
              {customKeepsakesEnabled ? "Whether it is a tiny collectible or a personalized figurine, we want it to feel worth keeping." : "Whether it is a tiny collectible or a little gift, we want it to feel worth keeping."}
            </p>
          </div>

          <div className={pageBg ? "overflow-hidden rounded-3xl bg-white shadow-lg grid grid-cols-1 divide-y divide-stone-200 md:grid-flow-col md:auto-cols-fr md:divide-x md:divide-y-0" : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"}>
            {TRUST_ITEMS.filter((item) => customKeepsakesEnabled || !item.custom).map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className={pageBg ? "p-5 sm:p-6" : "rounded-2xl border border-stone-200 bg-[#FBF8F4] p-5 sm:p-6"}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-ribbon-600 shadow-sm">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-stone-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`px-4 sm:px-6 lg:px-8 ${pageBg ? "py-5 sm:py-8" : "py-12 sm:py-16"}`}>
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            light={Boolean(pageBg)}
            eyebrow={customKeepsakesEnabled ? "Simple and personal" : "Simple and easy"}
            title="From Little Idea to Keepsake"
            description={customKeepsakesEnabled ? "A simple path from discovering something you love to making it yours." : "A simple path from discovering something you love to having it at your door."}
          />
          <div className={pageBg ? "mt-7 overflow-hidden rounded-3xl bg-white shadow-lg grid grid-cols-1 divide-y divide-stone-200 md:grid-flow-col md:auto-cols-fr md:divide-x md:divide-y-0" : "mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5"}>
            {[
              {
                number: "01",
                title: "Find your favourite",
                description: customKeepsakesEnabled
                  ? "Explore ready-to-buy collectibles or choose the personalized figurine that suits your occasion."
                  : "Explore our ready-to-buy 3D-printed collectibles and pick the one that makes you smile.",
              },
              ...(customKeepsakesEnabled
                ? [{
                    number: "02",
                    title: "Make it yours",
                    description: "For custom figurines, share your reference photo and select from the options available.",
                  }]
                : []),
              {
                number: "03",
                title: "We prepare your order",
                description: "Your selected item is prepared and packed for delivery. Check the product page for current timelines.",
              },
            ].map((step, i) => ({ ...step, number: String(i + 1).padStart(2, "0") })).map((step) => (
              <div
                key={step.number}
                className={pageBg ? "p-5 sm:p-6" : "rounded-2xl border border-stone-200 bg-white p-5 sm:p-6"}
              >
                <span className="font-mono text-sm font-bold text-ribbon-600">{step.number}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-stone-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={`px-4 sm:px-6 lg:px-8 ${pageBg ? "pb-8 pt-2 sm:pb-12" : "pb-12 sm:pb-16"}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-3xl bg-[#F0E3D8] p-6 sm:p-8 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ribbon-600">A little something special</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-stone-900 sm:text-3xl">
              Find a keepsake that feels like you.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
              {customKeepsakesEnabled
                ? "Shop the collection or create a personalized figurine from a favourite photo."
                : "Shop the collection of cute 3D-printed collectibles and little gifts."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-ribbon-300"
            >
              Shop collectibles <ArrowRight size={15} />
            </Link>
            {customKeepsakesEnabled && (
            <Link
              to="/personalized"
              className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <Sparkles size={16} /> Personalize yours
            </Link>
            )}
          </div>
        </div>
      </section>
      </div>

      {/* Modals */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={(product) => {
          setQuickViewProduct(null);
          openProductCustomizer(product);
        }}
      />

      {selectedProduct && (
        <ProductCustomizerModal
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
}
