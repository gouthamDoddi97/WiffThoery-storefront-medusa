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
        {price.calculated_price}
      </span>
    </div>
  )
}
