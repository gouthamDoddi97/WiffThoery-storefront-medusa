import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import GalleryProductActions from "@modules/products/components/gallery-product-actions"

/**
 * Fetches real time pricing for a product and renders gallery buy controls.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  accent,
}: {
  id: string
  region: HttpTypes.StoreRegion
  accent?: string
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  return (
    <GalleryProductActions product={product} region={region} accent={accent} />
  )
}
