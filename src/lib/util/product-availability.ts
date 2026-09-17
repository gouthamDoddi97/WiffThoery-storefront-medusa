export const PRODUCT_AVAILABILITY_KEY = "wt_availability"
export const PRODUCT_AVAILABILITY_OFFLINE = "offline"

export function isProductOffline(product: {
  metadata?: Record<string, unknown> | null
}): boolean {
  return product.metadata?.[PRODUCT_AVAILABILITY_KEY] === PRODUCT_AVAILABILITY_OFFLINE
}

export function isVariantOffline(variant: {
  metadata?: Record<string, unknown> | null
}): boolean {
  return variant.metadata?.[PRODUCT_AVAILABILITY_KEY] === PRODUCT_AVAILABILITY_OFFLINE
}

export function filterProductForOnlineStorefront<T extends {
  metadata?: Record<string, unknown> | null
  variants?: Array<{ metadata?: Record<string, unknown> | null }> | null
}>(product: T): T | null {
  if (isProductOffline(product)) {
    return null
  }

  const rawVariants = product.variants
  if (!rawVariants?.length) {
    return product
  }

  const variants = rawVariants.filter((variant) => !isVariantOffline(variant))

  if (!variants.length) {
    return null
  }

  if (variants.length === rawVariants.length) {
    return product
  }

  return { ...product, variants } as T
}

export function filterOnlineProducts<T extends {
  metadata?: Record<string, unknown> | null
  variants?: Array<{ metadata?: Record<string, unknown> | null }> | null
}>(products: T[]): T[] {
  const result: T[] = []
  for (const product of products) {
    const filtered = filterProductForOnlineStorefront(product)
    if (filtered) {
      result.push(filtered)
    }
  }
  return result
}
