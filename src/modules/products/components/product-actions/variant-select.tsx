import { formatVariantOptionLabel } from "@lib/util/variant-label"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type VariantSelectProps = {
  variants: HttpTypes.StoreProductVariant[]
  currentVariantId?: string
  onSelect: (variantId: string) => void
  title?: string
  disabled?: boolean
  "data-testid"?: string
}

export default function VariantSelect({
  variants,
  currentVariantId,
  onSelect,
  title = "Variant",
  disabled = false,
  "data-testid": dataTestId,
}: VariantSelectProps) {
  return (
    <div className="flex flex-col gap-y-3">
      <span className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-on-surface-variant">
        Select {title}
      </span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {variants.map((variant) => {
          if (!variant.id) return null
          const label = formatVariantOptionLabel(variant)
          const selected = variant.id === currentVariantId

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant.id!)}
              disabled={disabled}
              data-testid="option-button"
              className={clx(
                "min-w-[5.5rem] flex-1 border font-inter text-sm min-h-10 rounded-sm px-3 py-2 transition-colors duration-150 text-left small:text-center",
                {
                  "border-primary bg-primary/10 text-primary font-medium": selected,
                  "border-surface-variant/50 text-on-surface hover:border-primary/40":
                    !selected,
                }
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
