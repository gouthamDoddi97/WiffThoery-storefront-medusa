import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { getPerfumeDetails } from "@lib/data/perfume-details"
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
    const bgImage = product.images?.find((img) => /bg/i.test(img.url ?? ""))?.url ?? null
    return {
      id: product.id!,
      title: product.title!,
      handle: product.handle!,
      thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
      bgImage,
      tags: (product.tags ?? []).map((t) => ({ id: t.id!, value: t.value! })),
      cheapestPrice,
      scentStory: detailsList[i]?.scent_story ?? null,
      accent,
    }
  })

  return (
    <CollectionCarousel
      slides={slides}
      collectionHandle={collection.handle ?? ""}
      collectionTitle={collection.title ?? ""}
    />
  )
}
