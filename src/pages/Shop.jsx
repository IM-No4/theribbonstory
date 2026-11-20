
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X, ShoppingBag, RotateCcw } from "lucide-react";

import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import ProductCustomizerModal from "../components/ProductCustomizerModal";
import QuickViewModal from "../components/QuickViewModal";
import { OCCASIONS } from "../data/occasions";
import { useSeo } from "../utils/seo";
import { useCustomKeepsakes } from "../hooks/useCustomKeepsakes";

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
  const customKeepsakesEnabled = useCustomKeepsakes();
  useSeo({
    title: customKeepsakesEnabled ? "Shop 3D Printed Models & Personalized Keepsakes" : "Shop 3D Printed Collectibles",
    description: customKeepsakesEnabled
      ? "Discover cute 3D-printed fridge magnets, desk buddies, flexi creatures, miniature decor and personalized figurines."
      : "Discover cute 3D-printed fridge magnets, desk buddies, flexi creatures and miniature decor.",
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

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

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

  const clearAllFilters = () => {
    setParams(new URLSearchParams());
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

  const displayedProducts = useMemo(() => {
    if ((category === "all" || !category) && !sort && !search) {
      return mixProductsByCollection(products, categories);
    }
    return products;
  }, [products, categories, category, sort, search]);

  return (
    <main className="min-h-screen bg-white text-stone-800">
      {/* PAGE HEADER */}
      {/* The selected collection is highlighted below, so the heading is only shown for searches. */}
      <h1 className={search ? "mx-auto max-w-[1536px] px-4 pt-5 font-display text-xl font-bold text-stone-900 sm:px-6 sm:text-2xl lg:px-8 xl:px-12" : "sr-only"}>
        {heading}
        {search && (
          <button
            type="button"
            onClick={() => setParam("search", "")}
            className="ml-3 inline-flex items-center gap-1 align-middle font-sans text-xs font-semibold text-rose-700"
          >
            <X size={13} />
            Clear search
          </button>
        )}
      </h1>

      <div className="mx-auto max-w-[1536px] bg-white px-4 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-12">
        {/* ONE ROW: collections on the left, occasion + sort on the right */}
        <section className="space-y-3 pb-4">
          <nav
            aria-label="Product collections"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 no-scrollbar sm:mx-0 sm:px-0"
          >
            {/* The selected collection comes first, with a cross to remove it */}
            {[
              ...categories.filter((item) => item.slug === category && item.slug !== "all"),
              ...categories.filter((item) => item.slug !== category || item.slug === "all"),
            ].map((item) => {
              const selected = category === item.slug && item.slug !== "all";
              const allSelected = category === "all" && item.slug === "all";
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setParam("category", selected || item.slug === "all" ? "" : item.slug)}
                  aria-current={selected || allSelected ? "page" : undefined}
                  aria-label={selected ? `${item.name}, remove filter` : undefined}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                    selected || allSelected
                      ? "bg-rose-600 text-white shadow-sm"
                      : "border border-stone-200 bg-white text-stone-700 hover:border-rose-300 hover:text-rose-700"
                  }`}
                >
                  {item.name}
                  {selected && <X size={14} />}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
            <p className="hidden text-xs text-stone-500 sm:block">
              {loading ? "Loading…" : `${displayedProducts.length} ${displayedProducts.length === 1 ? "product" : "products"}`}
            </p>
            <div className="flex w-full items-center gap-2 sm:w-auto">
            <select
              aria-label="Occasion"
              value={occasion}
              onChange={(event) => setParam("occasion", event.target.value)}
              className="min-h-10 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none focus:border-rose-400 sm:flex-none sm:text-sm"
            >
              <option value="">All occasions</option>
              {OCCASIONS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => setParam("sort", event.target.value)}
              className="min-h-10 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-xs text-stone-700 outline-none focus:border-rose-400 sm:flex-none sm:text-sm"
            >
              {SORTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section className="min-w-0" aria-label="Products">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
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
              <h2 className="mt-4 font-display text-xl font-bold text-stone-900 sm:text-2xl">No products found</h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-stone-500 sm:text-sm">
                Try another collection or clear your filters to explore everything.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="btn-primary mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold sm:text-sm"
              >
                <RotateCcw size={14} />
                View all
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
