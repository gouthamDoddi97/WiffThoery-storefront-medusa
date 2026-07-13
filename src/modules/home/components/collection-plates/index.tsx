import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"

function sortHomeCollectionProducts(products: HttpTypes.StoreProduct[]) {
  return [...products].sort((a, b) => {
    const orderA = Number(a.metadata?.order ?? a.metadata?.home_order ?? NaN)
    const orderB = Number(b.metadata?.order ?? b.metadata?.home_order ?? NaN)

    if (!Number.isNaN(orderA) && !Number.isNaN(orderB) && orderA !== orderB) {
      return orderA - orderB
    }
    if (!Number.isNaN(orderA) && Number.isNaN(orderB)) return -1
    if (Number.isNaN(orderA) && !Number.isNaN(orderB)) return 1

    return (
      new Date(b.created_at ?? 0).getTime() -
      new Date(a.created_at ?? 0).getTime()
    )
  })
}

/**
 * The Collection — gallery-plate product grid on the home page,
 * matching the fableRedesign mockup ("THE COLLECTION" band).
 */
export default async function CollectionPlates({
  region,
  countryCode,
  embedded = false,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
  embedded?: boolean
}) {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 6 },
  })

  if (!products.length) return null

  const sortedProducts = sortHomeCollectionProducts(products)

  const grid = (
    <ul className="flex flex-col gap-4 xsmall:grid xsmall:grid-cols-2 small:grid-cols-3 xsmall:gap-x-6 xsmall:gap-y-6 mb-2">
      {sortedProducts.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductPreview product={product} region={region} />
        </li>
      ))}
    </ul>
  )

  if (embedded) return grid

  return (
    <section className="content-container py-5 small:py-6">{grid}</section>
  )
}
