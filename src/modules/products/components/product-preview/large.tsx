import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ProductRevealCard from "./reveal-card"

export default function ProductPreviewLarge({
  product,
  region,
  compact = false,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  compact?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <ProductRevealCard
      product={product}
      cheapestPrice={cheapestPrice}
      compact={compact}
    />
  )
}
