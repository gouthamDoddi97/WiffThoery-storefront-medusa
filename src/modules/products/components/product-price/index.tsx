import { clx } from "@medusajs/ui"

import PriceText from "@modules/common/components/price-text"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <div className="block w-32 h-9 bg-surface-container animate-pulse rounded-sm" />
    )
  }

  return (
    <div className="flex flex-col gap-1 py-1">
      <span
        className={clx(
          "font-grotesk font-bold text-2xl tracking-[-0.02em] text-on-surface",
          {
            "text-primary-container": selectedPrice.price_type === "sale",
          }
        )}
      >
        {!variant && (
          <span className="font-inter text-xs font-normal tracking-[0.12em] uppercase text-on-surface-muted mr-1">
            From
          </span>
        )}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          <PriceText>{selectedPrice.calculated_price}</PriceText>
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-inter text-sm">
          <span className="text-on-surface-muted">
            Original:{" "}
            <span
              className="line-through text-on-surface-variant"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              <PriceText>{selectedPrice.original_price}</PriceText>
            </span>
          </span>
          <span className="text-primary-container font-medium">
            -{selectedPrice.percentage_diff}%
          </span>
        </div>
      )}
    </div>
  )
}
