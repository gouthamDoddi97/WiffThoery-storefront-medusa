import { getActiveOffers } from "@lib/data/offers"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { HttpTypes } from "@medusajs/types"
import HomeTabs, { TabDef } from "./index"
import OffersPanel from "./offers-panel"
import NewArrivalsPanel from "./new-arrivals-panel"
import { CarouselSlide } from "@modules/home/components/featured-products/collection-carousel"

const NEW_ARRIVALS_ACCENT = "#C9A84C"

export default async function HomeDiscovery({
  region,
  countryCode,
}: {
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const [sets, newArrivalsResult] = await Promise.all([
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

  const rawProducts = newArrivalsResult.response.products

  // Build carousel slides (same shape as ProductRail)
  const detailsList = await Promise.all(
    rawProducts.map((p) => getPerfumeDetails(p.id!))
  )

  const newArrivalSlides: CarouselSlide[] = rawProducts.map((product, i) => {
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
      accent: NEW_ARRIVALS_ACCENT,
    }
  })

  // ── tab definitions (add more here as needed) ──
  const tabs: TabDef[] = [
    {
      key: "offers",
      label: "Offers",
      hasIndicator: sets.length > 0,
    },
    {
      key: "new-arrivals",
      label: "New Arrivals",
    },
    // future tab example:
    // { key: "featured", label: "Featured" },
  ]

  // ── panels must match tabs by index ──
  const panels: React.ReactNode[] = [
    <OffersPanel key="offers" sets={sets} />,
    <NewArrivalsPanel key="new-arrivals" slides={newArrivalSlides} />,
    // <FeaturedPanel key="featured" slides={...} />,
  ]

  return <HomeTabs tabs={tabs}>{panels}</HomeTabs>
}
