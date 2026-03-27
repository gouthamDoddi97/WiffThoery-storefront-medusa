import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  return (
    <div className="content-container py-16">
      {/* Rail header */}
      <div className="flex items-end justify-between mb-10">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">FEATURED</span>
          <h2 className="section-heading text-2xl small:text-3xl">
            {collection.title}
          </h2>
        </div>
        <LocalizedClientLink
          href={`/collections/${collection.handle}`}
          className="font-inter text-xs tracking-[0.15em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2"
        >
          VIEW ALL
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </LocalizedClientLink>
      </div>

      {/* Product grid */}
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-px bg-surface-variant/10">
        {pricedProducts.slice(0, 4).map((product) => (
          <li key={product.id} className="bg-surface-lowest">
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
