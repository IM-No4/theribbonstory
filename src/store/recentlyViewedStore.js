import { create } from "zustand";
import { persist } from "zustand/middleware";

if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("trs_recently_viewed");
  } catch {}
}

export const useRecentlyViewedStore = create(
  persist(
    (set) => ({
      items: [],
      addRecentlyViewed: () => {},
      clearRecentlyViewed: () => set({ items: [] }),
    }),
    {
      name: "trs_recently_viewed",
    }
  )
);
