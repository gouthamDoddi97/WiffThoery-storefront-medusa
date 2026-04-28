import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FragranceSet } from "@lib/data/offers"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { getProductReviews, ProductReview, ReviewStats } from "@lib/data/reviews"
import ProductReviews from "@modules/products/components/product-reviews"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getPricesForVariant } from "@lib/util/get-product-price"
import SetInteractiveSection, { EnrichedSetItem } from "@modules/sets/components/set-interactive-section"

// ── main template ─────────────────────────────────────────────────────────────

export default async function SetDetailTemplate({
  set,
  countryCode,
}: {
  set: FragranceSet
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  // Fetch full product data for each item in the set (with variant prices)
  const uniqueProductIds = Array.from(new Set(set.items.map((i) => i.product_id)))

  const [productsResult, perfumeDetailsList] = await Promise.all([
    region
      ? listProducts({
          countryCode,
          queryParams: {
            id: uniqueProductIds as string[],
            region_id: region.id,
            limit: uniqueProductIds.length,
            fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*images",
          },
        })
      : null,
    Promise.all(uniqueProductIds.map((pid) => getPerfumeDetails(pid))),
  ])

  const fetchedProducts = productsResult?.response.products ?? []

  // Build enriched items — match each set item to its fetched product + details
  const enrichedItems: EnrichedSetItem[] = set.items.map((item) => {
    const product = fetchedProducts.find((p) => p.id === item.product_id) ?? null
    const detailsIndex = uniqueProductIds.indexOf(item.product_id)
    const details = detailsIndex >= 0 ? perfumeDetailsList[detailsIndex] : null

    // Scene URLs from perfume details — these are used in the parallax, not the carousel
    const sceneUrls = new Set(
      [details?.scene_image_1, details?.scene_image_2, details?.scene_image_3]
        .filter(Boolean) as string[]
    )
    const isBg = (url: string) =>
      /\bbg\b/i.test(decodeURIComponent(url.split("/").pop() ?? ""))

    // Find the exact variant's price and variant-specific images
    let variantPrice: string | null = null
    let variantImages: { id: string; url: string }[] = []
    if (product) {
      const variant = product.variants?.find((v) => v.id === item.variant_id)
      const prices = getPricesForVariant(variant)
      if (prices?.calculated_price) variantPrice = prices.calculated_price

      // Find images exclusive to this variant (not shared with any other variant).
      // These are the truly variant-specific images. Falls back to all variant images when
      // no exclusive images exist (e.g. single-variant products).
      const allVariants = product.variants ?? []
      const currentImgIds = new Set(
        ((variant as any)?.images ?? []).map((i: any) => i.id as string)
      )
      const sharedImgIds = new Set(
        allVariants
          .filter((v) => v.id !== variant?.id)
          .flatMap((v) => ((v as any)?.images ?? []).map((i: any) => i.id as string))
      )
      const exclusiveIds = Array.from(currentImgIds).filter((id) => !sharedImgIds.has(id))
      const targetIds = exclusiveIds.length > 0 ? new Set(exclusiveIds) : currentImgIds

      if (targetIds.size > 0) {
        variantImages = (product.images ?? [])
          .filter((img) => img.id && targetIds.has(img.id) && img.url && !sceneUrls.has(img.url) && !isBg(img.url))
          .sort((a, b) => ((a as any).rank ?? 0) - ((b as any).rank ?? 0))
          .map((img) => ({ id: img.id!, url: img.url! }))
      }
    }

    return { item, product, details, variantPrice, variantImages }
  })

  // Fetch reviews for all unique products in parallel
  const allReviewResults = await Promise.all(
    uniqueProductIds.map((pid) => getProductReviews(pid))
  )

  const mergedReviews: ProductReview[] = allReviewResults
    .flatMap((r) => r.reviews)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const combinedStats: ReviewStats = {
    total: mergedReviews.length,
    average:
      mergedReviews.length > 0
        ? Math.round(
            (mergedReviews.reduce((sum, r) => sum + r.rating, 0) / mergedReviews.length) * 10
          ) / 10
        : null,
  }

  const firstProductId = uniqueProductIds[0] ?? ""

  const relatedProducts = region
    ? await listProducts({
        countryCode,
        queryParams: { region_id: region.id, limit: 4, is_giftcard: false },
      }).then(({ response }) => response.products)
    : []

  return (
    <div className="bg-surface-lowest min-h-screen">
      {/* breadcrumb */}
      <div className="content-container pt-6 pb-2">
        <nav className="flex items-center gap-2 text-[9px] font-inter tracking-[0.2em] uppercase text-on-surface-disabled">
          <LocalizedClientLink href="/" className="hover:text-on-surface transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-on-surface">{set.title}</span>
        </nav>
      </div>

      {/* ── main interactive section (carousel + product panel + set showcase) ── */}
      <div className="content-container pb-4">
        <SetInteractiveSection
          set={set}
          enrichedItems={enrichedItems}
          countryCode={countryCode}
        />
      </div>

      {/* ── REVIEWS (pooled from all products in the set) ── */}
      <ProductReviews
        productId={firstProductId}
        initialReviews={mergedReviews}
        initialStats={combinedStats}
      />

      {/* ── YOUR NEXT CHAPTER ── */}
      {region && relatedProducts.length > 0 && (
        <div className="content-container py-16">
          <div className="flex flex-col gap-2 mb-10">
            <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled">
              YOUR NEXT CHAPTER
            </span>
            <h2 className="font-garamond font-semibold text-2xl text-on-surface">
              There is always a next chapter waiting.
            </h2>
          </div>
          <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-4 gap-y-8">
            {relatedProducts.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
