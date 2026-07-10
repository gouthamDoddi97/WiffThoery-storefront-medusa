"use client"

import { formatVariantDisplayLabel } from "@lib/util/variant-label"
import { getPricesForVariant } from "@lib/util/get-product-price"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"

type GalleryVariantSelectProps = {
  variants: HttpTypes.StoreProductVariant[]
  currentVariantId?: string
  onSelect: (variantId: string) => void
  accent?: string
  disabled?: boolean
}

const HAIRLINE = "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)"

export default function GalleryVariantSelect({
  variants,
  currentVariantId,
  onSelect,
  accent = "var(--tier-popular)",
  disabled = false,
}: GalleryVariantSelectProps) {
  const priced = variants.filter((v) => v.id && (v as any).calculated_price)

  if (priced.length <= 1) return null

  return (
    <div className="flex gap-3">
      {priced.map((variant) => {
        if (!variant.id) return null
        const selected = variant.id === currentVariantId
        const size = formatVariantDisplayLabel(variant)
        const price = getPricesForVariant(variant)?.calculated_price ?? ""

        return (
          <button
            key={variant.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(variant.id!)}
            className="flex-1 min-h-[44px] px-3 py-1.5 rounded-md font-mono text-[11px] tracking-[0.14em] uppercase transition-colors duration-150 disabled:opacity-40"
            style={{
              border: selected ? `var(--hairline-width) solid ${accent}` : HAIRLINE,
              color: selected ? accent : "var(--on-surface)",
              background: selected
                ? `color-mix(in srgb, ${accent} 6%, var(--surface-lowest))`
                : "var(--surface-lowest)",
            }}
          >
            <span className="block">{size}</span>
            <span className="block mt-0.5 font-medium">
              <PriceText>{price}</PriceText>
            </span>
          </button>
        )
      })}
    </div>
  )
}
