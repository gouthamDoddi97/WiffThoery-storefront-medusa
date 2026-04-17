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
  const uniqueProductIds = [...new Set(set.items.map((i) => i.product_id))]

  const [productsResult, perfumeDetailsList] = await Promise.all([
    region
      ? listProducts({
          countryCode,
          queryParams: {
            id: uniqueProductIds as string[],
            region_id: region.id,
            limit: uniqueProductIds.length,
            fields: "*variants.calculated_price,*variants.images",
          },
        })
      : null,
    Promise.all(uniqueProductIds.map((pid) => getPerfumeDetails(pid))),
  ])

  const fetchedProducts = productsResult?.response.products ?? []

  // Build enriched items — match each set item to its fetched product + details
  const enrichedItems: EnrichedSetItem[] = set.items.map((item, idx) => {
    const product = fetchedProducts.find((p) => p.id === item.product_id) ?? null
    const detailsIndex = uniqueProductIds.indexOf(item.product_id)
    const details = detailsIndex >= 0 ? perfumeDetailsList[detailsIndex] : null

    // Find the exact variant's price and variant-specific images
    let variantPrice: string | null = null
    let variantImages: { id: string; url: string }[] = []
    if (product) {
      const variant = product.variants?.find((v) => v.id === item.variant_id)
      const prices = getPricesForVariant(variant)
      if (prices?.calculated_price) variantPrice = prices.calculated_price
      // Use images assigned to this variant; fallback to product images
      const vImgs = (variant as any)?.images as { id: string; url: string }[] | null
      if (vImgs && vImgs.length > 0) {
        variantImages = vImgs
      } else if (product.images && product.images.length > 0) {
        variantImages = product.images.map((img) => ({ id: img.id ?? "", url: img.url ?? "" }))
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
