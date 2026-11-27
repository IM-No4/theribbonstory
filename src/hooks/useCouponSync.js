import { useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";
import { useCartStore } from "../store/cartStore";

/**
 * Re-checks the applied coupon whenever the cart total, delivery type or delivery
 * charges change, so the discount stays correct and a coupon that no longer
 * applies (e.g. free delivery on an order that is now free anyway) is removed.
 */
export function useCouponSync(subtotal, deliverySlot, charges) {
  const code = useCartStore((s) => s.appliedCoupon?.code);

  useEffect(() => {
    if (!code || subtotal <= 0) return undefined;
    let stale = false;
    api
      .post("/coupons/apply", { code, subtotal, deliverySlot })
      .then(({ data }) => {
        if (!stale) useCartStore.getState().setCoupon(data);
      })
      .catch((err) => {
        // Only drop it when the server refused it, not when the request failed
        const status = err.response?.status;
        if (stale || (status !== 400 && status !== 404)) return;
        useCartStore.getState().removeCoupon();
        toast(`${code} removed: ${err.response.data?.message || "it no longer applies"}`, { icon: "ℹ️", id: "coupon-removed" });
      });
    return () => {
      stale = true;
    };
  }, [code, subtotal, deliverySlot, charges?.freeShippingThreshold, charges?.standardFee, charges?.expressFee]);
}
