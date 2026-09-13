import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      items: [],
      addRecentlyViewed: (product) => {
        if (!product || (!product._id && !product.slug)) return;
        const current = get().items;
        const id = product._id || product.slug;
        const filtered = current.filter((p) => (p._id || p.slug) !== id);
        // Put the most recent on top, keep max 8 items
        set({ items: [product, ...filtered].slice(0, 8) });
      },
      clearRecentlyViewed: () => set({ items: [] }),
    }),
    {
      name: "trs_recently_viewed",
    }
  )
);
