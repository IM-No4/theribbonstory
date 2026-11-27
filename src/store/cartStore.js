import { create } from "zustand";
import toast from "react-hot-toast";
import { piecesInLine, piecesInCart } from "../utils/packSize";
import { trackCart } from "../utils/analytics";

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

// The first value of each option group is what a product is sold as unless the customer picks another
export const defaultOptions = (product) =>
  (product?.optionGroups || [])
    .filter((group) => group.values?.length)
    .map((group) => ({ name: group.name, value: group.values[0].label, priceDelta: group.values[0].priceDelta || 0 }));

const optionsKey = (options) => options.map((o) => `${o.name}:${o.value}`).sort().join("|");

/** The ready-made cart line for this product with exactly these options (e.g. single vs set) */
export const findProductLine = (items, product, options = defaultOptions(product)) => {
  const productId = product?._id || product?.id || product?.slug;
  const wanted = optionsKey(options);
  return (items || []).find(
    (i) =>
      i.productId === productId &&
      !i.customization?.photoUrl &&
      !i.customization?.cuteImageUrl &&
      // lines saved without options are the default choice
      optionsKey(i.selectedOptions?.length ? i.selectedOptions : defaultOptions(product)) === wanted
  );
};

// Plain catalog product -> cart line (prices are re-checked by the server at checkout)
export const productToCartItem = (product, quantity = 1) => ({
  productId: product._id || product.id,
  name: product.name,
  image: product.images?.[0] || product.image,
  price: product.price,
  quantity,
  stock: typeof product.stock === "number" ? product.stock : undefined,
  selectedOptions: defaultOptions(product),
  customization: {},
});

export const WEEKLY_KEEPSAKE_THRESHOLD = 5;

export const isCustomKeepsakeItem = (item) =>
  Boolean(
    item?.isCustomKeepsake ||
    item?.customization?.photoUrl ||
    item?.customization?.cuteImageUrl ||
    item?.customization?.reference3D?.sessionId ||
    item?.customization?.reference3D?.approvedPreview ||
    item?.customization?.categorySlug ||
    item?.fromCatalog === false ||
    item?.hamper?.keepsakeId === "3d-miniature" ||
    (typeof item?.productId === "string" && (
      item.productId.startsWith("custom-3d-") ||
      item.productId.startsWith("keepsake-")
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

    // Stock is counted in pieces and shared by every pack size of the product
    const availableStock = typeof finalItem.stock === "number" ? finalItem.stock : (existingIndex > -1 && typeof items[existingIndex].stock === "number" ? items[existingIndex].stock : undefined);

    if (typeof availableStock === "number" && !isCustomKeepsakeItem(finalItem)) {
      if (availableStock <= 0) {
        toast.error(`Sorry, "${finalItem.name}" is out of stock`);
        return false;
      }
      if (piecesInCart(items, finalItem.productId) + piecesInLine(finalItem) > availableStock) {
        toast.error(`Sorry, only ${availableStock} piece(s) of "${finalItem.name}" in stock`);
        return false;
      }
    }

    if (existingIndex > -1) {
      const targetQty = items[existingIndex].quantity + finalItem.quantity;
      items[existingIndex] = {
        ...items[existingIndex],
        quantity: targetQty,
        ...(typeof availableStock === "number" ? { stock: availableStock } : {}),
      };
    } else {
      items.push({
        ...finalItem,
        id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        ...(typeof availableStock === "number" ? { stock: availableStock } : {}),
      });
    }
    persist(items);
    set({ items, ...(openDrawer ? { isCartOpen: true } : {}) });
    trackCart("add_to_cart", finalItem, Number(finalItem.quantity) || 1);
    return true;
  },

  updateQuantity: (id, quantity) => {
    const existing = get().items.find((i) => i.id === id);
    if (!existing) return;

    if (quantity > existing.quantity) {
      if (typeof existing.stock === "number" && !isCustomKeepsakeItem(existing)) {
        const others = piecesInCart(get().items.filter((i) => i.id !== id), existing.productId);
        if (others + piecesInLine({ ...existing, quantity }) > existing.stock) {
          toast.error(`Only ${existing.stock} piece(s) available in stock`);
          return;
        }
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
    const change = Math.max(0, quantity) - existing.quantity;
    if (change) trackCart(change > 0 ? "add_to_cart" : "remove_from_cart", existing, Math.abs(change));
  },

  removeItem: (id) => {
    const removed = get().items.find((i) => i.id === id);
    const items = get().items.filter((i) => i.id !== id);
    persist(items);
    set({ items });
    if (removed) trackCart("remove_from_cart", removed, removed.quantity);
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
