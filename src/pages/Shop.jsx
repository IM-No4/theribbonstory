import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import RecentlyViewed from "../components/RecentlyViewed";
import { OCCASIONS } from "../data/occasions";
import { useSeo } from "../utils/seo";

const sorts = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function Shop() {
  useSeo({ title: "Shop All Keepsakes & Gifts", description: "Browse personalised photo magnets, 3D keepsakes, polaroid art and gift hampers. Handcrafted in India with express delivery." });
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const occasion = params.get("occasion") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "";

  const [categories, setCategories] = useState([{ slug: "all", name: "All Keepsakes" }]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch dynamic categories from DB
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => {
        if (data.categories && data.categories.length > 0) {
          setCategories([{ slug: "all", name: "All Keepsakes" }, ...data.categories]);
        }
      })
      .catch((err) => console.error("Failed to load collections:", err));
  }, []);

  // Fetch products from DB
  useEffect(() => {
    setLoading(true);
    const query = { sort };
    if (category !== "all") query.category = category;
    if (occasion) query.occasion = occasion;
    if (search) query.search = search;
    api
      .get("/products", { params: query })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, occasion, search, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const occasionMeta = OCCASIONS.find((o) => o.slug === occasion);

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (occasionMeta) return `Keepsakes for ${occasionMeta.name}`;
    return categories.find((c) => c.slug === category)?.name || "All Keepsakes";
  }, [category, search, occasionMeta, categories]);

  return (
    <div className="bg-cream-50 min-h-screen py-12 sm:py-16">
      <div className="container-page">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <span className="section-eyebrow">The Keepsake Collection</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-burgundy-900">{heading}</h1>
          <p className="text-sm text-espresso-400">
            Physical representations of your favorite moments, thoughtfully designed and crafted.
          </p>
        </div>

        {/* Occasion Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setParam("occasion", "")}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              !occasion
                ? "border-burgundy-900 bg-burgundy-900 text-cream-50 shadow-xs"
                : "border-espresso-200/60 bg-white text-espresso-600 hover:border-ribbon-300"
            }`}
          >
            All Moments
          </button>
          {OCCASIONS.map((o) => (
            <button
              key={o.slug}
              onClick={() => setParam("occasion", occasion === o.slug ? "" : o.slug)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                occasion === o.slug
                  ? "border-burgundy-900 bg-burgundy-900 text-cream-50 shadow-xs"
                  : "border-espresso-200/60 bg-white text-espresso-600 hover:border-ribbon-300"
              }`}
            >
              <o.icon size={13} /> {o.name}
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="mt-6 flex items-center justify-between lg:hidden">
          <button onClick={() => setFiltersOpen(true)} className="btn-outline !py-2 !px-4 text-xs cursor-pointer">
            <SlidersHorizontal size={14} /> Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="input-field !w-auto text-xs py-2"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Desktop Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block space-y-8">
            <div>
              <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-burgundy-900 mb-3">
                Collections
              </h4>
              <ul className="space-y-1">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <button
                      onClick={() => setParam("category", c.slug === "all" ? "" : c.slug)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                        (category === c.slug || (category === "all" && c.slug === "all"))
                          ? "bg-blush-100 text-burgundy-900 font-bold border border-blush-200"
                          : "text-espresso-500 hover:bg-white hover:text-burgundy-900"
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-burgundy-900 mb-3">
                Sort By
              </h4>
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="input-field text-xs py-2.5"
              >
                {sorts.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-blush-100/60 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center text-espresso-400 bg-white rounded-3xl border border-blush-200 p-8">
                <p className="font-display text-2xl text-burgundy-900">No keepsakes found</p>
                <p className="mt-2 text-xs">Try selecting a different collection or clearing search filters.</p>
                <button
                  onClick={() => {
                    setParams(new URLSearchParams());
                  }}
                  className="btn-primary mt-4 py-2.5 px-6 text-xs cursor-pointer"
                >
                  View All Keepsakes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p, i) => (
                  <ProductCard
                    key={p._id || p.slug}
                    product={p}
                    index={i}
                    onQuickView={setQuickViewProduct}
                    onPersonalize={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Keepsakes */}
        <RecentlyViewed />
      </div>

      {/* Modals */}
      <ProductCustomizerModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={setSelectedProduct}
      />
    </div>
  );
}
