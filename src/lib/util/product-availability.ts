export const PRODUCT_AVAILABILITY_KEY = "wt_availability"
export const PRODUCT_AVAILABILITY_OFFLINE = "offline"

export function isProductOffline(product: {
  metadata?: Record<string, unknown> | null
}): boolean {
  return product.metadata?.[PRODUCT_AVAILABILITY_KEY] === PRODUCT_AVAILABILITY_OFFLINE
}

export function filterOnlineProducts<T extends { metadata?: Record<string, unknown> | null }>(
  products: T[]
): T[] {
  return products.filter((product) => !isProductOffline(product))
}
