import { HttpTypes } from "@medusajs/types"

function decodeLabelSource(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/** Extract a compact size like "20ML" when present in text. */
function extractMlLabel(text: string): string | null {
  const match = decodeLabelSource(text).match(/\b(\d+)\s*-?\s*ml\b/i)
  return match ? `${match[1]}ML` : null
}

/** Button label on the product page — the variant title is the option. */
export function formatVariantOptionLabel(
  variant: HttpTypes.StoreProductVariant
): string {
  const fromOption = variant.options?.find((o) => o.value)?.value
  if (fromOption) {
    return fromOption.trim()
  }

  return variant.title?.trim() || "Standard"
}

/** Compact label for catalog cards — variant title, or size when title has no ml. */
export function formatVariantDisplayLabel(
  variant: HttpTypes.StoreProductVariant
): string {
  const fromOption = variant.options?.find((o) => o.value)?.value
  if (fromOption) {
    return extractMlLabel(fromOption) ?? fromOption.trim()
  }

  const title = variant.title?.trim() ?? ""
  const mlInTitle = title ? extractMlLabel(title) : null
  if (mlInTitle) {
    return mlInTitle
  }

  // Titles like "pet bottle" — infer size from decoded thumbnail filename
  const thumb = variant.thumbnail ?? ""
  const mlInThumb = thumb ? extractMlLabel(thumb) : null
  if (mlInThumb) {
    return mlInThumb
  }

  return title || "Standard"
}

/** True when each variant is its own selectable option (typical Whiff workflow). */
export function productUsesVariantPicker(product: HttpTypes.StoreProduct): boolean {
  if ((product.variants?.length ?? 0) <= 1) {
    return false
  }

  const optionAxes = (product.options ?? []).filter(
    (option) => (option.values?.length ?? 0) > 0
  )

  return optionAxes.length <= 1
}
