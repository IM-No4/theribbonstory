import { create } from "zustand";
import toast from "react-hot-toast";

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
  image: product.images?.[0] || product.image,
  price: product.price,
  quantity,
  stock: typeof product.stock === "number" ? product.stock : undefined,
  selectedOptions: [],
  customization: {},
});

export const WEEKLY_KEEPSAKE_THRESHOLD = 5;

export const isCustomKeepsakeItem = (item) =>
  Boolean(
    item?.customization?.photoUrl ||
    item?.customization?.cuteImageUrl ||
    item?.customization?.reference3D ||
    item?.customization?.category ||
    item?.fromCatalog === false ||
    item?.sizeId ||
    item?.hamper?.keepsakeId === "3d-miniature" ||
    (typeof item?.productId === "string" && (
      item.productId.startsWith("custom-3d-") ||
      item.productId.startsWith("keepsake-")
    )) ||
    (typeof item?.name === "string" && (
      item.name.toLowerCase().includes("3d") ||
      item.name.toLowerCase().includes("keepsake") ||
      item.name.toLowerCase().includes("figurine")
    ))
  );

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

    // Enforce weekly studio threshold on custom 3D keepsakes
    if (isCustomKeepsakeItem(finalItem)) {
      const currentKeepsakeTotal = items
        .filter(isCustomKeepsakeItem)
        .reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
      const incomingQty = Number(finalItem.quantity) || 1;
      if (currentKeepsakeTotal + incomingQty > WEEKLY_KEEPSAKE_THRESHOLD) {
        toast.error(
          `Weekly studio limit reached! Maximum ${WEEKLY_KEEPSAKE_THRESHOLD} custom 3D keepsakes allowed per order to ensure artisan quality.`,
          { id: "weekly-threshold-alert", duration: 4000 }
        );
        return false;
      }
    }

    // If stock limit is provided, ensure total does not exceed available stock
    const availableStock = typeof finalItem.stock === "number" ? finalItem.stock : (existingIndex > -1 && typeof items[existingIndex].stock === "number" ? items[existingIndex].stock : undefined);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const targetQty = currentQty + finalItem.quantity;
      if (typeof availableStock === "number") {
        if (availableStock <= 0) {
          toast.error(`Sorry, "${finalItem.name}" is out of stock`);
          return false;
        }
        if (targetQty > availableStock) {
          toast.error(`Sorry, only ${availableStock} left in stock for "${finalItem.name}"`);
          return false;
        }
      }
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: targetQty,
        ...(typeof availableStock === "number" ? { stock: availableStock } : {}),
      };
    } else {
      if (typeof availableStock === "number") {
        if (availableStock <= 0) {
          toast.error(`Sorry, "${finalItem.name}" is out of stock`);
          return false;
        }
        if (finalItem.quantity > availableStock) {
          toast.error(`Sorry, only ${availableStock} left in stock for "${finalItem.name}"`);
          return false;
        }
      }
      items.push({
        ...finalItem,
        id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        ...(typeof availableStock === "number" ? { stock: availableStock } : {}),
      });
    }
    persist(items);
    set({ items, ...(openDrawer ? { isCartOpen: true } : {}) });
    return true;
  },

  updateQuantity: (id, quantity) => {
    const existing = get().items.find((i) => i.id === id);
    if (!existing) return;

    if (quantity > existing.quantity) {
      if (typeof existing.stock === "number" && quantity > existing.stock) {
        toast.error(`Only ${existing.stock} available in stock`);
        return;
      }

      // Check weekly threshold for custom keepsakes
      if (isCustomKeepsakeItem(existing)) {
        const otherKeepsakes = get()
          .items.filter((i) => i.id !== id && isCustomKeepsakeItem(i))
          .reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
        if (otherKeepsakes + quantity > WEEKLY_KEEPSAKE_THRESHOLD) {
          toast.error(
            `Weekly studio limit reached! Maximum ${WEEKLY_KEEPSAKE_THRESHOLD} custom 3D keepsakes allowed per order.`,
            { id: "weekly-threshold-alert", duration: 4000 }
          );
          return;
        }
      }
    }

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
