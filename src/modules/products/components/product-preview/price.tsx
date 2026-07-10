import { VariantPrice } from "types/global"
import PriceText from "@modules/common/components/price-text"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && (
        <span
          className="font-inter text-xs text-on-surface-disabled line-through"
          data-testid="original-price"
        >
          <PriceText>{price.original_price}</PriceText>
        </span>
      )}
      <span
        className={
          price.price_type === "sale"
            ? "font-mono font-medium text-sm text-secondary"
            : "font-mono font-medium text-sm text-on-surface"
        }
        data-testid="price"
      >
        <span className="font-mono font-normal text-[9px] tracking-[0.14em] uppercase text-on-surface-muted mr-1">From</span>
        <PriceText>{price.calculated_price}</PriceText>
      </span>
    </div>
  )
}

export function VariantPriceList({
  variantPrices,
  priceTextClass = "text-sm",
}: {
  variantPrices: { id?: string; size: string; price: VariantPrice }[]
  priceTextClass?: string
}) {
  if (!variantPrices.length) return null

  return (
    <div className="flex flex-col gap-1">
      {variantPrices.map(({ id, size, price }, i) => (
        <div key={id ?? `${size}-${i}`} className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted shrink-0 min-w-[2.75rem]">
            {size}
          </span>
          <span className="font-mono text-[9px] text-on-surface-muted">—</span>
          <span
            className={`font-mono font-medium ${priceTextClass} ${
              price.price_type === "sale" ? "text-secondary" : "text-on-surface"
            }`}
          >
            <PriceText>{price.calculated_price}</PriceText>
          </span>
          {price.price_type === "sale" && (
            <span className="font-mono text-xs text-on-surface-muted line-through">
              <PriceText>{price.original_price}</PriceText>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
