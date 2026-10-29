import { create } from "zustand";

const STORAGE_KEY = "trs_cart";
const COUPON_KEY = "trs_applied_coupon";

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return raw.map((item) => {
      const cuteImg = item.customization?.cuteImageUrl || item.customization?.reference3D?.approvedPreview;
      if (cuteImg && item.image !== cuteImg) {
        return { ...item, image: cuteImg };
      }
      return item;
    });
  } catch {
    return [];
  }
};

const loadCoupon = () => {
  try {
    return JSON.parse(localStorage.getItem(COUPON_KEY) || "null");
  } catch {
    return null;
  }
};

const persist = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
const persistCoupon = (coupon) => {
  if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
  else localStorage.removeItem(COUPON_KEY);
};

// Lines merge only when everything printed on them is the same
const lineKey = (item) => {
  const c = item.customization || {};
  return [item.productId, JSON.stringify(item.selectedOptions || []), c.photoUrl, c.cuteImageUrl || c.reference3D?.approvedPreview, c.customName, c.customDate, c.note]
    .map((v) => v || "")
    .join("|");
};

// Plain catalog product -> cart line (prices are re-checked by the server at checkout)
export const productToCartItem = (product, quantity = 1) => ({
  productId: product._id || product.id,
  name: product.name,
  image: product.images?.[0],
  price: product.price,
  quantity,
  selectedOptions: [],
  customization: {},
});

export const useCartStore = create((set, get) => ({
  items: load(),
  appliedCoupon: loadCoupon(),
  isCartOpen: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  setCoupon: (coupon) => {
    persistCoupon(coupon);
    set({ appliedCoupon: coupon });
  },

  removeCoupon: () => {
    persistCoupon(null);
    set({ appliedCoupon: null });
  },

  addItem: (item, openDrawer = true) => {
    const items = [...get().items];
    const cuteImg = item.customization?.cuteImageUrl || item.customization?.reference3D?.approvedPreview;
    const finalItem = cuteImg ? { ...item, image: cuteImg } : item;
    const key = lineKey(finalItem);
    const existingIndex = items.findIndex((i) => lineKey(i) === key);
    if (existingIndex > -1) {
      items[existingIndex] = { ...items[existingIndex], quantity: items[existingIndex].quantity + finalItem.quantity };
    } else {
      items.push({ ...finalItem, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}` });
    }
    persist(items);
    set({ items, ...(openDrawer ? { isCartOpen: true } : {}) });
  },

  updateQuantity: (id, quantity) => {
    let items = get().items.map((i) => (i.id === id ? { ...i, quantity } : i));
    items = items.filter((i) => i.quantity > 0);
    persist(items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    persist(items);
    set({ items });
  },

  clearCart: () => {
    persist([]);
    persistCoupon(null);
    set({ items: [], appliedCoupon: null });
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => {
      const optionsTotal = (i.selectedOptions || []).reduce((s, o) => s + (Number(o.priceDelta) || 0), 0);
      return sum + (i.price + optionsTotal) * i.quantity;
    }, 0),

  discount: () => {
    const coupon = get().appliedCoupon;
    if (!coupon) return 0;
    return coupon.calculatedDiscount || 0;
  },
}));
