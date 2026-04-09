import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CollectionCarousel from "../collection-carousel"

const TIER_ACCENTS: Record<string, string> = {
  popular: "#4FDBCC",
  unique:  "#FFB547",
  idgf:    "#FF6B5A",
}

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
      fields: "*variants.calculated_price,+tags",
    },
  })

  if (!pricedProducts || pricedProducts.length === 0) {
    return null
  }

  const accent = TIER_ACCENTS[collection.handle ?? ""] ?? "#C9A84C"

  // Fetch perfume details for all products in parallel
  const detailsList = await Promise.all(
    pricedProducts.slice(0, 6).map((p) => getPerfumeDetails(p.id!))
  )

  const slides = pricedProducts.slice(0, 6).map((product, i) => {
    const { cheapestPrice } = getProductPrice({ product })
    return {
      id: product.id!,
      title: product.title!,
      handle: product.handle!,
      thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
      tags: (product.tags ?? []).map((t) => ({ id: t.id!, value: t.value! })),
      cheapestPrice,
      scentStory: detailsList[i]?.scent_story ?? null,
      accent,
    }
  })

  return (
    <div className="content-container py-16">
      {/* Rail header */}
      <div className="flex items-end justify-between mb-10">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">FEATURED</span>
          <h2
            className="font-garamond italic font-normal text-2xl small:text-3xl text-on-surface"
            style={{ letterSpacing: "-0.01em" }}
          >
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

      <CollectionCarousel
        slides={slides}
        collectionHandle={collection.handle ?? ""}
        collectionTitle={collection.title ?? ""}
      />
    </div>
  )
}
