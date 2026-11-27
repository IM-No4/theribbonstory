export const isFreeDeliveryCoupon = (coupon) => coupon?.discountType === "free_shipping";

export const couponLabel = (coupon) => {
  if (isFreeDeliveryCoupon(coupon)) return "free delivery";
  return coupon.discountType === "percentage" ? `${coupon.discountAmount}% off` : `₹${coupon.discountAmount} off`;
};

/** A free delivery coupon is only offered when there is a delivery charge it can remove */
export const isCouponOffered = (coupon, { subtotal, charges, express = false }) => {
  if (!isFreeDeliveryCoupon(coupon)) return true;
  if (!charges) return false;
  const standard = subtotal >= charges.freeShippingThreshold ? 0 : charges.standardFee;
  const extra = express && coupon.coversExpress ? charges.expressFee : 0;
  return standard + extra > 0;
};
