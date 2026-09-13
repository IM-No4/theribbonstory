import { create } from "zustand";

const getStoredWishlist = () => {
  try {
    const saved = localStorage.getItem("ribbon_wishlist");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const useWishlistStore = create((set, get) => ({
  items: getStoredWishlist(),
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),

  toggleWishlist: (product) => {
    const { items } = get();
    const exists = items.some((item) => (item._id || item.id) === (product._id || product.id));
    let newItems;
    if (exists) {
      newItems = items.filter((item) => (item._id || item.id) !== (product._id || product.id));
    } else {
      newItems = [...items, product];
    }
    try {
      localStorage.setItem("ribbon_wishlist", JSON.stringify(newItems));
    } catch (e) {}
    set({ items: newItems });
    return !exists;
  },

  isInWishlist: (productId) => {
    const { items } = get();
    return items.some((item) => (item._id || item.id) === productId);
  },

  removeItem: (productId) => {
    const { items } = get();
    const newItems = items.filter((item) => (item._id || item.id) !== productId);
    try {
      localStorage.setItem("ribbon_wishlist", JSON.stringify(newItems));
    } catch (e) {}
    set({ items: newItems });
  },

  clearWishlist: () => {
    try {
      localStorage.removeItem("ribbon_wishlist");
    } catch (e) {}
    set({ items: [] });
  },
}));
