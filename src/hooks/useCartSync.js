import { useEffect } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

/**
 * Keeps a copy of a signed-in customer's bag on the server. On a device with an
 * empty bag the saved one is brought back; after that this device's bag is saved.
 */
export function useCartSync() {
  const userId = useAuthStore((s) => (s.user && s.user.role !== "admin" ? s.user._id || s.user.id : null));

  useEffect(() => {
    if (!userId) return undefined;
    let stopped = false;
    let timer = null;
    let unsubscribe = null;

    const save = (items) => api.put("/cart", { items }).catch(() => {});

    const start = async () => {
      if (useCartStore.getState().items.length === 0) {
        try {
          const { data } = await api.get("/cart");
          if (!stopped && data.items?.length) useCartStore.getState().restoreItems(data.items);
        } catch {
          return; // don't overwrite the saved bag if it couldn't be read
        }
      }
      if (stopped) return;
      const current = useCartStore.getState().items;
      if (current.length) save(current);
      unsubscribe = useCartStore.subscribe((state, previous) => {
        if (state.items === previous.items) return;
        clearTimeout(timer);
        timer = setTimeout(() => save(useCartStore.getState().items), 1500);
      });
    };
    start();

    return () => {
      stopped = true;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [userId]);
}
