import { listProducts } from "@lib/data/products"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { CarouselSlide } from "@modules/home/components/featured-products/collection-carousel"
import NewArrivalsPanel from "@modules/home/components/home-tabs/new-arrivals-panel"

const NEW_ARRIVALS_ACCENT = "#C9A84C"

export default async function HomeNewArrivalsSection({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const result = await listProducts({
    countryCode,
    queryParams: {
      region_id: region.id,
      limit: 8,
      is_giftcard: false,
      order: "-created_at",
      fields: "*variants.calculated_price,+tags",
    },
  })

  const rawProducts = result.response.products

  if (!rawProducts.length) return null

  const detailsList = await Promise.all(
    rawProducts.map((p) => getPerfumeDetails(p.id!))
  )

  const slides: CarouselSlide[] = rawProducts.map((product, i) => {
    const { cheapestPrice } = getProductPrice({ product })
    const bgImage =
      product.images?.find((img) => /bg/i.test(img.url ?? ""))?.url ?? null
    return {
      id: product.id!,
      title: product.title!,
      handle: product.handle!,
      thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
      bgImage,
      tags: (product.tags ?? []).map((t) => ({ id: t.id!, value: t.value! })),
      cheapestPrice,
      scentStory: detailsList[i]?.scent_story ?? null,
      accent: NEW_ARRIVALS_ACCENT,
    }
  })

  return <NewArrivalsPanel slides={slides} />
}
