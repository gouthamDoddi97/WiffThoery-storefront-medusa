import { getActiveOffers } from "@lib/data/offers"
import { enrichSetThumbnails } from "@lib/data/enrich-set-thumbnails"
import { listProducts } from "@lib/data/products"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { CarouselSlide } from "@modules/home/components/featured-products/collection-carousel"
import NewArrivalsPanel from "@modules/home/components/home-tabs/new-arrivals-panel"

const ACCENT = "var(--primary)"

export default async function HomeOffersNewArrivalsSection({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  // Fetch offers and latest products in parallel
  const [rawOffers, newArrivalsResult] = await Promise.all([
    getActiveOffers(),
    listProducts({
      countryCode,
      queryParams: {
        region_id: region.id,
        limit: 8,
        is_giftcard: false,
        order: "-created_at",
        fields: "*variants.calculated_price,+tags",
      },
    }),
  ])

  const offerSlides: CarouselSlide[] = []

  if (rawOffers && rawOffers.length) {
    const sets = await enrichSetThumbnails(rawOffers, countryCode)

    for (const set of sets) {
      const thumbnail = set.items?.[0]?.thumbnail ?? set.set_image ?? null
      const bgImage = set.set_image ?? null
      const tags = set.tags
        ? set.tags.split(",").map((t: any, i: any) => ({ id: `${set.id}-t-${i}`, value: t.trim() }))
        : []

      offerSlides.push({
        id: set.id,
        title: set.title,
        handle: set.id,
        thumbnail,
        bgImage,
        tags,
        cheapestPrice: null,
        scentStory: set.description ?? null,
        accent: ACCENT,
        href: `/sets/${set.id}`,
      })
    }
  }

  const rawProducts = newArrivalsResult.response.products

  if ((!offerSlides.length && !rawProducts.length) || !rawProducts.length) {
    // If there are no slides at all, don't render
    if (!offerSlides.length) return null
  }

  const detailsList = await Promise.all(
    rawProducts.map((p: any) => getPerfumeDetails(p.id!))
  )

  const productSlides: CarouselSlide[] = rawProducts.map((product: any, i: number) => {
    const { cheapestPrice } = getProductPrice({ product })
    const bgImage = product.images?.find((img: any) => /bg/i.test(img.url ?? ""))?.url ?? null
    return {
      id: product.id!,
      title: product.title!,
      handle: product.handle!,
      thumbnail: product.thumbnail ?? product.images?.[0]?.url ?? null,
      bgImage,
      tags: (product.tags ?? []).map((t: any) => ({ id: t.id!, value: t.value! })),
      cheapestPrice,
      scentStory: detailsList[i]?.scent_story ?? null,
      accent: ACCENT,
      href: `/products/${product.handle}`,
    }
  })

  const slides = [...offerSlides, ...productSlides]

  if (!slides.length) return null

  return <NewArrivalsPanel slides={slides} />
}
