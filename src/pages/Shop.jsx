
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  X,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import { OCCASIONS } from "../data/occasions";
import { useSeo } from "../utils/seo";

const SORTS = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const DEFAULT_CATEGORY = {
  slug: "all",
  name: "All Creations",
};

/**
 * Interleaves products across collections in a round-robin order so the "All Creations"
 * view displays a diverse, balanced mix rather than clumped items from one collection.
 */
function mixProductsByCollection(products, categories = []) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const groups = new Map();

  // Pre-seed groups in categories order so collections are traversed in configured sequence
  if (Array.isArray(categories) && categories.length > 0) {
    for (const cat of categories) {
      if (cat?.slug && cat.slug !== "all") groups.set(cat.slug, []);
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

export default function Shop() {
  useSeo({
    title: "Shop 3D Printed Models & Personalized Keepsakes",
    description:
      "Discover cute 3D-printed fridge magnets, desk buddies, flexi creatures, miniature decor and personalized figurines.",
  });

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const category = params.get("category") || "all";
  const occasion = params.get("occasion") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "";

  const [categories, setCategories] = useState([DEFAULT_CATEGORY]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [draftCategory, setDraftCategory] = useState(category);
  const [draftOccasion, setDraftOccasion] = useState(occasion);
  const [draftSort, setDraftSort] = useState(sort);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Keep draft filters synchronized with URL filters.
  useEffect(() => {
    setDraftCategory(category);
    setDraftOccasion(occasion);
    setDraftSort(sort);
  }, [category, occasion, sort]);

  // Lock background scrolling while the filter drawer is open.
  useEffect(() => {
    if (!filtersOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filtersOpen]);

  // Load product collections.
  useEffect(() => {
    let cancelled = false;

    api
      .get("/categories")
      .then(({ data }) => {
        if (cancelled) return;

        const fetchedCategories = data?.categories || [];

        setCategories([
          DEFAULT_CATEGORY,
          ...fetchedCategories.filter((item) => item.slug !== "all"),
        ]);
      })
      .catch((error) => {
        console.error("Failed to load collections:", error);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch products according to the URL filters.
  useEffect(() => {
    let cancelled = false;

    const query = {};

    if (category !== "all") query.category = category;
    if (occasion) query.occasion = occasion;
    if (search) query.search = search;
    if (sort) query.sort = sort;

    setLoading(true);

    api
      .get("/products", { params: query })
      .then(({ data }) => {
        if (!cancelled) setProducts(data?.products || []);
      })
      .catch((error) => {
        console.error("Failed to load products:", error);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, occasion, search, sort]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);

    if (value) next.set(key, value);
    else next.delete(key);

    setParams(next);
  };

  const openFilters = () => {
    setDraftCategory(category);
    setDraftOccasion(occasion);
    setDraftSort(sort);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    const next = new URLSearchParams(params);

    if (draftCategory && draftCategory !== "all") {
      next.set("category", draftCategory);
    } else {
      next.delete("category");
    }

    if (draftOccasion) next.set("occasion", draftOccasion);
    else next.delete("occasion");

    if (draftSort) next.set("sort", draftSort);
    else next.delete("sort");

    setParams(next);
    setFiltersOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftCategory("all");
    setDraftOccasion("");
    setDraftSort("");
  };

  const clearAllFilters = () => {
    setParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  const handlePersonalize = (product) => {
    if (
      product.category === "personalized-3d" ||
      product.slug === "custom-3d-keepsake-figurine"
    ) {
      navigate("/personalized");
    } else {
      setSelectedProduct(product);
    }
  };

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;

    const occasionItem = OCCASIONS.find(
      (item) => item.slug === occasion
    );

    if (occasionItem) return `For ${occasionItem.name}`;

    return (
      categories.find((item) => item.slug === category)?.name ||
      "All Creations"
    );
  }, [category, occasion, search, categories]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (occasion ? 1 : 0) +
    (sort ? 1 : 0);

  const displayedProducts = useMemo(() => {
    if ((category === "all" || !category) && !sort && !search) {
      return mixProductsByCollection(products, categories);
    }
    return products;
  }, [products, categories, category, sort, search]);

  const selectedCategoryName =
    categories.find((item) => item.slug === category)?.name ||
    "All Creations";

  return (
    <main className="min-h-screen bg-white text-stone-800">
      {/* PAGE HEADER */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-[1536px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 xl:px-12 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 sm:text-[11px]">
                  The Ribbon Story Collection
                </span>
              </div>

              <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                {heading}
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-stone-600 sm:text-sm">
                Little collectibles, playful desk companions and thoughtful keepsakes
                made to bring a little personality to everyday life.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setParam("search", "")}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"
                >
                  <X size={14} />
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1536px] bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-12">
        {/* COMPACT TOOLBAR: NO HORIZONTAL OCCASION CAROUSEL */}
        <section className="flex items-center justify-between gap-3 border-y border-stone-200 py-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-stone-500 sm:text-sm">
              Browse our collection
            </p>
          </div>

          <button
            type="button"
            onClick={openFilters}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 text-xs font-semibold text-stone-800 transition hover:border-rose-300 sm:px-4"
          >
            <SlidersHorizontal size={15} />
            <span>Filter &amp; Sort</span>

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </section>

        {/* ACTIVE FILTER CHIPS */}
        {(category !== "all" || occasion || search) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-500">Showing:</span>

            {category !== "all" && (
              <button
                type="button"
                onClick={() => setParam("category", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-800"
              >
                {selectedCategoryName}
                <X size={12} />
              </button>
            )}

            {occasion && (
              <button
                type="button"
                onClick={() => setParam("occasion", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-800"
              >
                {OCCASIONS.find((item) => item.slug === occasion)?.name ||
                  occasion}
                <X size={12} />
              </button>
            )}

            {search && (
              <button
                type="button"
                onClick={() => setParam("search", "")}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-800"
              >
                {search}
                <X size={12} />
              </button>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-1 text-[11px] font-semibold text-stone-500 underline underline-offset-2 hover:text-rose-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* SHOP CONTENT */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:mt-7 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-stone-900">
                    Collections
                  </h2>
                </div>

                <nav aria-label="Product collections" className="space-y-1">
                  {categories.map((item) => {
                    const selected = category === item.slug;

                    return (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() =>
                          setParam(
                            "category",
                            item.slug === "all" ? "" : item.slug
                          )
                        }
                        aria-current={selected ? "page" : undefined}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                          selected
                            ? "bg-rose-50 font-bold text-rose-800 ring-1 ring-inset ring-rose-100"
                            : "text-stone-600 hover:bg-white hover:text-stone-900"
                        }`}
                      >
                        <span>{item.name}</span>
                        {selected && <ChevronRight size={14} />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <h2 className="mb-3 text-xs font-bold text-stone-900">
                  Sort products
                </h2>

                <select
                  aria-label="Sort products"
                  value={sort}
                  onChange={(event) => setParam("sort", event.target.value)}
                  className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none focus:border-rose-400"
                >
                  {SORTS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="font-display text-base font-bold text-stone-900">
                  Something personal?
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                  Turn a favourite photo into a personalized figurine.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/personalized")}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900"
                >
                  Create your figurine <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <section className="min-w-0" aria-label="Products">
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 min-[1120px]:grid-cols-4 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-stone-100 bg-white"
                  >
                    <div className="aspect-square animate-pulse bg-stone-100" />
                    <div className="space-y-2 p-3 sm:p-4">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-stone-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-stone-100" />
                      <div className="mt-3 h-8 animate-pulse rounded-lg bg-stone-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-10 text-center sm:min-h-[360px] sm:rounded-3xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                  <ShoppingBag size={24} />
                </div>

                <h2 className="mt-4 font-display text-xl font-bold text-stone-900 sm:text-2xl">
                  No keepsakes found
                </h2>

                <p className="mt-2 max-w-sm text-xs leading-relaxed text-stone-500 sm:text-sm">
                  Try another collection or clear your filters to explore all
                  available creations.
                </p>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-primary mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold sm:text-sm"
                >
                  <RotateCcw size={14} />
                  View all creations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 min-[1120px]:grid-cols-4 xl:grid-cols-4">
                {displayedProducts.map((product, index) => (
                  <ProductCard
                    key={product._id || product.slug}
                    product={product}
                    index={index}
                    onQuickView={setQuickViewProduct}
                    onPersonalize={handlePersonalize}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* UNIFIED FILTER & SORT DRAWER */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="fixed inset-0 bg-stone-950/45 backdrop-blur-[2px] transition-opacity"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-dialog-title"
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl rounded-none overflow-hidden"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
              <div>
                <h2
                  id="filter-dialog-title"
                  className="font-display text-xl font-bold text-stone-900"
                >
                  Filter &amp; Sort
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Find your perfect keepsake
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
              {/* COLLECTIONS */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-800">
                  Collections
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {categories.map((item) => {
                    const selected = draftCategory === item.slug;

                    return (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => setDraftCategory(item.slug)}
                        aria-pressed={selected}
                        className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          selected
                            ? "border-rose-300 bg-rose-50 text-rose-800"
                            : "border-stone-200 bg-white text-stone-700"
                        }`}
                      >
                        <span>{item.name}</span>
                        {selected && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OCCASION */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-800">
                  Occasion
                </h3>

                <select
                  value={draftOccasion}
                  onChange={(event) => setDraftOccasion(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-rose-400"
                >
                  <option value="">All occasions</option>
                  {OCCASIONS.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SORT */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-stone-800">
                  Sort by
                </h3>

                <div className="space-y-2">
                  {SORTS.map((item) => (
                    <label
                      key={item.value}
                      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-3"
                    >
                      <input
                        type="radio"
                        name="mobile-sort"
                        value={item.value}
                        checked={draftSort === item.value}
                        onChange={() => setDraftSort(item.value)}
                        className="accent-rose-600"
                      />
                      <span className="text-xs font-medium text-stone-700">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-stone-200 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetDraftFilters}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-xs font-bold text-stone-700"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="btn-primary inline-flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold"
                >
                  Apply filters
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PRODUCT MODALS */}
      <ProductCustomizerModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onOpenCustomizer={(product) => {
          setQuickViewProduct(null);
          handlePersonalize(product);
        }}
      />
    </main>
  );
}
