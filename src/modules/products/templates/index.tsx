import { Suspense } from "react"

import OrderAlertBanner from "@modules/common/components/order-alert-banner"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductReviews from "@modules/products/components/product-reviews"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getCollectionTiers, CollectionTierMeta } from "@lib/data/collection-tier"
import { getProductReviews } from "@lib/data/reviews"
import { readLabLogEntries } from "@lib/util/lab-log"
import { hasVlogContent } from "@lib/util/scent-vlog"
import { getPlantImagesForPyramid } from "@lib/data/plant-images"

import GalleryProductActions from "@modules/products/components/gallery-product-actions"
import VariantImageCarousel from "@modules/products/components/variant-image-carousel"
import ProductSpecTable from "@modules/products/components/product-spec-table"
import NotePyramid from "@modules/products/components/note-pyramid"
import LabLogTeaser from "@modules/products/components/lab-log-teaser"

// ─── Tier metadata ───────────────────────────────────────────────────────────

type TierDisplayMeta = {
  badge: string
  accentClass: string
  accentColor: string
  glowColor: string
  nextHref?: string
  nextBadge?: string
  nextLabel?: string
}

const TIER_META_FALLBACK: Record<string, TierDisplayMeta> = {
  popular: {
    badge: "01 — POPULAR",
    accentClass: "text-tier-popular",
    accentColor: "var(--tier-popular)",
    glowColor: "rgba(117,84,46,0.07)",
    nextHref: "/categories/unique",
    nextBadge: "LADDER TIER: 01 — POPULAR",
    nextLabel: "EXPLORE UNIQUE",
  },
  unique: {
    badge: "02 — UNIQUE",
    accentClass: "text-tier-unique",
    accentColor: "var(--tier-unique)",
    glowColor: "rgba(138,53,80,0.07)",
    nextHref: "/categories/idgf",
    nextBadge: "LADDER TIER: 02 — UNIQUE",
    nextLabel: "EXPLORE IDGF",
  },
  idgf: {
    badge: "03 — IDGF",
    accentClass: "text-tier-idgf",
    accentColor: "var(--tier-idgf)",
    glowColor: "rgba(27,69,56,0.07)",
  },
}

const TIER_HANDLES = Object.keys(TIER_META_FALLBACK)

function mergeTierMeta(
  backend: CollectionTierMeta | undefined,
  fallback: TierDisplayMeta | undefined
): TierDisplayMeta | null {
  if (!fallback && !backend) return null
  const fb = fallback ?? ({} as TierDisplayMeta)
  return {
    badge: fb.badge,
    accentClass: fb.accentClass,
    accentColor: fb.accentColor,
    glowColor: fb.glowColor,
    nextHref: backend?.next_tier_href ?? fb.nextHref,
    nextBadge: fb.nextBadge,
    nextLabel: backend?.next_tier_cta ?? fb.nextLabel,
  }
}

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const [perfume, tierMap, reviewsData, labLogEntries, vlogAvailable] =
    await Promise.all([
    getPerfumeDetails(product.id),
    getCollectionTiers(),
    getProductReviews(product.id),
    readLabLogEntries(product.handle ?? ""),
    hasVlogContent(product.handle ?? ""),
  ])

  const plantImages = await getPlantImagesForPyramid(
    perfume?.top_notes,
    perfume?.middle_notes,
    perfume?.base_notes
  )

  const tierHandle =
    product.categories?.find((c) => TIER_HANDLES.includes(c.handle ?? ""))
      ?.handle ?? null
  const tier = mergeTierMeta(
    tierHandle ? tierMap[tierHandle] : undefined,
    tierHandle ? TIER_META_FALLBACK[tierHandle] : undefined
  )

  const accent =
    (product.metadata?.accent_color as string) ??
    tier?.accentColor ??
    "var(--tier-unique)"

  const sceneImages: [string?, string?, string?] = [
    perfume?.scene_image_1 ?? images[0]?.url ?? undefined,
    perfume?.scene_image_2 ?? images[1]?.url ?? undefined,
    perfume?.scene_image_3 ?? images[2]?.url ?? undefined,
  ]
  const sceneUrlSet = new Set(sceneImages.filter(Boolean) as string[])

  const bottleImages = images
    .filter((img) => {
      if (!img.url) return false
      if (sceneUrlSet.has(img.url)) return false
      if (/\bbg\b/i.test(decodeURIComponent(img.url.split("/").pop() ?? "")))
        return false
      return true
    })
    .sort((a, b) => {
      const num = (url: string) => {
        const match = url.split("/").pop()?.match(/^(\d+)/)
        return match ? parseInt(match[1], 10) : Infinity
      }
      return num(a.url ?? "") - num(b.url ?? "")
    })

  const artStyle =
    (product.metadata?.art_style as string) ||
    product.collection?.title?.toUpperCase() ||
    ""
  const batchNo = product.metadata?.batch_no
    ? `BATCH Nº ${product.metadata.batch_no}`
    : ""
  const placard = [product.title?.toUpperCase(), artStyle, batchNo]
    .filter(Boolean)
    .join(" — ")
    .replace(/ — BATCH/, " · BATCH")

  const concentration =
    (product.metadata?.concentration as string) ?? "25%"
  const perfumeType =
    (product.metadata?.perfume_type as string) ?? "APPAREL PERFUME"

  const longevityMobile = perfume?.longevity
    ? `${String(perfume.longevity).replace(/\s*hrs?/i, "")}+ HRS ON FABRIC`
    : "8+ HRS ON FABRIC"

  const longevityDesktop = perfume?.longevity
    ? String(perfume.longevity).toUpperCase()
    : "8-10 HRS"

  const specRowsMobile = [
    { k: "TYPE", v: perfumeType },
    { k: "CONCENTRATION", v: concentration },
    { k: "LONGEVITY", v: longevityMobile },
    { k: "APPLICATION", v: "SPRAY ON CLOTHING" },
  ]

  const specRowsDesktop = [
    { k: "CONCENTRATION", v: concentration },
    { k: "LONGEVITY", v: longevityDesktop },
    batchNo ? { k: "BATCH", v: batchNo.replace("BATCH ", "") } : null,
    { k: "MADE IN", v: "VIZAG, INDIA" },
  ].filter((row): row is { k: string; v: string } => !!row)

  return (
    <div data-testid="product-container" className="bg-surface-lowest">
      {/* <OrderAlertBanner /> */}

      {/* ─── GALLERY PDP — matches fableRedesign 10 / 16 ─── */}
      <section className="border-b rule-ink">
        <div className="content-container pt-4 pb-28 small:py-12 small:pb-12">
          <div className="grid grid-cols-1 small:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-6 small:gap-x-14 small:gap-y-12 items-start">
            {/* Left — artwork gallery */}
            <div className="relative small:sticky small:top-24">
              <div
                className="hidden small:block absolute -left-16 top-8 bottom-8 w-32 pointer-events-none opacity-40"
                aria-hidden
                style={{
                  background: `radial-gradient(ellipse at 30% 50%, color-mix(in srgb, ${accent} 32%, transparent), transparent 72%)`,
                }}
              />
              <VariantImageCarousel
                allImages={bottleImages.map((img) => ({
                  id: img.id ?? "",
                  url: img.url ?? "",
                  alt: product.title ?? "",
                }))}
                variants={(product.variants ?? []) as any}
                sceneUrls={Array.from(sceneUrlSet)}
                placard={placard}
                accent={accent}
              />
            </div>

            {/* Right — placard, specs, pyramid, buy */}
            <div className="flex flex-col gap-0 min-w-0 small:pt-2 small:max-w-[520px]">
              <span className="hidden small:block font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-muted mb-3">
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-primary transition-colors"
                >
                  SHOP
                </LocalizedClientLink>
                {" / "}
                <span className="text-on-surface">
                  {product.title?.toUpperCase()}
                </span>
              </span>

              <h1
                className="font-garamond serif-display font-medium text-on-surface leading-[1.05] small:mt-1"
                style={{
                  fontSize: "clamp(2rem, 5vw, 2.85rem)",
                  fontStyle: "normal",
                }}
              >
                {product.title}
              </h1>

              {perfume?.caption && (
                <p className="font-garamond italic text-lg small:text-xl text-on-surface-variant mt-1.5">
                  {perfume.caption}
                </p>
              )}

              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface-muted mt-2.5">
                <span className="small:hidden">
                  {perfumeType} · {concentration}
                </span>
                <span className="hidden small:inline">
                  EAU DE PARFUM · {concentration} · {perfumeType}
                </span>
              </p>

              <div className="mt-3 small:mt-4">
                <div className="small:hidden">
                  <ProductSpecTable rows={specRowsMobile} />
                </div>
                <div className="hidden small:block">
                  <ProductSpecTable rows={specRowsDesktop} />
                </div>
              </div>

              <NotePyramid
                top={perfume?.top_notes}
                heart={perfume?.middle_notes}
                base={perfume?.base_notes}
                plantImages={plantImages}
              />

              <ProductOnboardingCta />
              <GalleryProductActions
                product={product}
                region={region}
                accent={accent}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FROM THE LAB LOG ─── */}
      <LabLogTeaser
        handle={product.handle ?? ""}
        entries={labLogEntries}
        showVlogLink={vlogAvailable || !!perfume?.scent_story}
      />

      {/* ─── TIER UPGRADE CTA ─── */}
      {tier?.nextHref && (
        <section className="py-16 bg-surface-lowest border-t rule-ink">
          <div className="content-container">
            <div className="border rule-ink p-8 small:p-12 flex flex-col small:flex-row items-start small:items-center justify-between gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-on-surface-muted">
                  {tier.nextBadge}
                </span>
                <h3
                  className="font-garamond serif-display font-medium text-3xl small:text-4xl text-on-surface"
                  style={{ fontStyle: "normal" }}
                >
                  Graduate to a Scene Stealer.
                </h3>
                <p className="font-inter text-sm text-on-surface-variant max-w-[440px]">
                  If this is your daily signature, the next step in your
                  olfactory evolution awaits.
                </p>
              </div>
              <LocalizedClientLink href={tier.nextHref}>
                <button className="btn-ghost">{tier.nextLabel} →</button>
              </LocalizedClientLink>
            </div>
          </div>
        </section>
      )}

      <div className="content-container py-10 max-w-[720px]">
        <ProductTabs product={product} />
      </div>

      <ProductReviews
        productId={product.id}
        initialReviews={reviewsData.reviews}
        initialStats={reviewsData.stats}
      />

      <div
        className="content-container py-16"
        data-testid="related-products-container"
      >
        <div className="flex flex-col gap-2 mb-10">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-muted">
            Recommended
          </span>
          <h2 className="font-garamond font-semibold text-2xl text-on-surface">
            You may also like.
          </h2>
        </div>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
