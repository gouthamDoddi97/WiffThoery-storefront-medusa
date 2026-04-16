import { VariantPrice } from "types/global"

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
          {price.original_price}
        </span>
      )}
      <span
        className={
          price.price_type === "sale"
            ? "font-grotesk font-semibold text-sm text-secondary"
            : "font-grotesk font-semibold text-sm text-primary"
        }
        data-testid="price"
      >
        <span className="font-inter font-normal text-[10px] tracking-[0.1em] uppercase text-on-surface-disabled mr-1">From</span>
        {price.calculated_price}
      </span>
    </div>
  )
}

export function VariantPriceList({
  variantPrices,
  priceTextClass = "text-sm",
}: {
  variantPrices: { size: string; price: VariantPrice }[]
  priceTextClass?: string
}) {
  if (!variantPrices.length) return null

  return (
    <div className="flex flex-col gap-1">
      {variantPrices.map(({ size, price }) => (
        <div key={size} className="flex items-center gap-2">
          <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled w-8 shrink-0">
            {size}
          </span>
          <span className="font-inter text-[9px] text-on-surface-disabled">—</span>
          <span
            className={`font-grotesk font-semibold ${priceTextClass} ${
              price.price_type === "sale" ? "text-secondary" : "text-primary"
            }`}
          >
            {price.calculated_price}
          </span>
          {price.price_type === "sale" && (
            <span className="font-inter text-xs text-on-surface-disabled line-through">
              {price.original_price}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
