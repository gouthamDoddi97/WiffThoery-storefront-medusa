import { HttpTypes } from "@medusajs/types"

function variantInStock(variant: HttpTypes.StoreProductVariant): boolean {
  if (!variant.manage_inventory) return true
  return (variant.inventory_quantity ?? 0) > 0
}

function variantPriceAmount(variant: HttpTypes.StoreProductVariant): number {
  return variant.calculated_price?.calculated_amount ?? Number.POSITIVE_INFINITY
}

/** Pick a variant for quick-add / bulk-add when the shopper has not chosen a size. */
export function getCartVariantId(
  product: HttpTypes.StoreProduct
): string | null {
  const variants = product.variants ?? []
  if (!variants.length) return null
  if (variants.length === 1) return variants[0].id ?? null

  const purchasable = variants.filter(variantInStock)
  const pool = purchasable.length ? purchasable : variants

  const sorted = [...pool].sort(
    (a, b) => variantPriceAmount(a) - variantPriceAmount(b)
  )

  return sorted[0]?.id ?? null
}

export function productNeedsVariantSelection(
  product: HttpTypes.StoreProduct
): boolean {
  return (product.variants?.length ?? 0) > 1
}
