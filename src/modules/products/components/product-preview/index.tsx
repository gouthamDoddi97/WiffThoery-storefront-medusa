import { HttpTypes } from "@medusajs/types"
import ProductPreviewCard from "./product-preview-card"

type ProductPreviewProps = {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  /** Show collection title + tier on the card (store catalog) */
  showCollectionTier?: boolean
}

export default function ProductPreview({
  product,
  showCollectionTier = false,
}: ProductPreviewProps) {
  return (
    <ProductPreviewCard product={product} showCollectionTier={showCollectionTier} />
  )
}
