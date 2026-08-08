/** Lightweight fields for nav cart dropdown — avoids heavy product metadata on every page. */
export const NAV_CART_FIELDS =
  "id,currency_code,subtotal,*items,*items.thumbnail,*items.variant,*items.variant.product.images,+items.total"
