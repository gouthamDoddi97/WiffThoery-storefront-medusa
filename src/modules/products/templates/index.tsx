import { Suspense } from "react"

import OrderAlertBanner from "@modules/common/components/order-alert-banner"
import ProductActions from "@modules/products/components/product-actions"
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
import PerformanceChart from "@modules/products/components/performance-chart"

import ProductActionsWrapper from "./product-actions-wrapper"

// ─── Tier metadata ───────────────────────────────────────────────────────────

type TierDisplayMeta = {
  badge: string
  accentClass: string
  glowColor: string
  nextHref?: string
  nextBadge?: string
  nextLabel?: string
}

// Fallback used when the backend returns no data for a handle
const TIER_META_FALLBACK: Record<string, TierDisplayMeta> = {
  "crowd-pleaser": {
    badge: "01 — CROWD PLEASER",
    accentClass: "text-primary",
    glowColor: "rgba(79,219,204,0.07)",
    nextHref: "/categories/intro-to-niche",
    nextBadge: "LADDER TIER: 01 — CROWD PLEASER",
    nextLabel: "EXPLORE INTRO TO NICHE",
  },
  "intro-to-niche": {
    badge: "02 — INTRO TO NICHE",
    accentClass: "text-tertiary",
    glowColor: "rgba(255,181,71,0.07)",
    nextHref: "/categories/polarizing-art",
    nextBadge: "LADDER TIER: 02 — INTRO TO NICHE",
    nextLabel: "EXPLORE POLARIZING ART",
  },
  "polarizing-art": {
    badge: "03 — POLARIZING ART",
    accentClass: "text-secondary",
    glowColor: "rgba(255,107,90,0.07)",
  },
}

const TIER_HANDLES = Object.keys(TIER_META_FALLBACK)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToGlow(hex: string | null | undefined): string | null {
  if (!hex) return null
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return `rgba(${r},${g},${b},0.07)`
}

function resolveAccentClass(color: string | null | undefined): string | null {
  if (!color) return null
  const c = color.toLowerCase()
  if (c.includes("ffb") || c.includes("ffd")) return "text-tertiary"
  if (c.includes("ff6") || c.includes("ff4")) return "text-secondary"
  return "text-primary"
}

function mergeTierMeta(
  backend: CollectionTierMeta | undefined,
  fallback: TierDisplayMeta | undefined
): TierDisplayMeta | null {
  if (!fallback && !backend) return null
  const fb = fallback ?? ({} as TierDisplayMeta)
  return {
    badge: fb.badge,
    accentClass: resolveAccentClass(backend?.accent_color) ?? fb.accentClass,
    glowColor: hexToGlow(backend?.accent_color) ?? fb.glowColor,
    nextHref: backend?.next_tier_href ?? fb.nextHref,
    nextBadge: fb.nextBadge,
    nextLabel: backend?.next_tier_cta ?? fb.nextLabel,
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

// ─── Template ────────────────────────────────────────────────────────────────

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const [perfume, tierMap, reviewsData] = await Promise.all([
    getPerfumeDetails(product.id),
    getCollectionTiers(),
    getProductReviews(product.id),
  ])
  const tierHandle =
    product.categories?.find((c) => TIER_HANDLES.includes(c.handle ?? ""))
      ?.handle ?? null
  const tier = mergeTierMeta(
    tierHandle ? tierMap[tierHandle] : undefined,
    tierHandle ? TIER_META_FALLBACK[tierHandle] : undefined
  )

  // Sort images numerically (1.jpg, 2.jpg, 3.jpg …) then skip the
  // first 3 which are reserved as scene images for the cinematic scroll branch.
  const sortedImages = [...images].sort((a, b) => {
    const num = (url: string) => {
      const match = url.split("/").pop()?.match(/^(\d+)/)
      return match ? parseInt(match[1], 10) : Infinity
    }
    return num(a.url ?? "") - num(b.url ?? "")
  })
  const nonSceneImages = sortedImages.slice(3)

  // Classify remaining images by filename substring
  const regularImgs = nonSceneImages.filter(
    (img) => !/art|bg/i.test(img.url ?? "")
  )
  const heroImg = regularImgs[0]?.url
  const stripImg = regularImgs[1]?.url
  const artImg = nonSceneImages.find((img) => /art/i.test(img.url ?? ""))?.url ?? heroImg
  const bgImg = nonSceneImages.find((img) => /bg/i.test(img.url ?? ""))?.url

  return (
    <div data-testid="product-container" className="bg-surface-lowest">
      <OrderAlertBanner />

      {/* ─── HERO ─── */}
      <section className="relative bg-surface-container overflow-hidden" style={{ minHeight: "72vh" }}>
        {/* BG image */}
        {bgImg && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${bgImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
            }}
          />
        )}
        {/* Tier glow */}
        {tier && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 70% 40%, ${tier.glowColor} 0%, transparent 65%)`,
            }}
          />
        )}

        <div
          className="content-container relative z-10 flex flex-col small:flex-row items-center justify-between gap-10 py-20 small:py-28"
          style={{ minHeight: "72vh" }}
        >
          {/* Left: text */}
          <div className="flex flex-col gap-5 flex-1">
            {tier && (
              <span
                className={`font-inter text-[11px] tracking-[0.25em] uppercase ${tier.accentClass}`}
              >
                {tier.badge}
              </span>
            )}
            <h1 className="font-grotesk font-bold text-5xl small:text-[5.5rem] text-on-surface tracking-[-0.03em] leading-[0.88]">
              {product.title}
            </h1>
            {perfume?.certifications && (
              <p className="font-inter text-sm italic text-on-surface-variant">
                {perfume.certifications}
              </p>
            )}
            <p className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
              EAU DE PARFUM · EXTRAIT · CRAFTED IN INDIA
            </p>
          </div>

          {/* Right: product image */}
          {heroImg && (
            <div className="flex-shrink-0 w-full small:w-[360px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImg}
                alt={product.title || "Product"}
                className="h-[300px] small:h-[460px] w-full object-contain drop-shadow-2xl"
              />
            </div>
          )}
        </div>
      </section>

      {/* ─── ADD TO CART ─── */}
      <section className="bg-surface-low py-8 border-b border-surface-variant/20">
        <div className="content-container max-w-[580px] mx-auto flex flex-col gap-4">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions disabled={true} product={product} region={region} />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
            {(["GENUINE EXTRAIT", "GRAPHIC-ART PACKAGING", "TRANSPARENT PRICING"] as const).map(
              (badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary flex-shrink-0" />
                  <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-variant">
                    {badge}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── THE IMPRESSION ─── */}
      {perfume?.scent_story && (
        <section className="py-20 bg-surface-lowest">
          <div className="content-container grid grid-cols-1 small:grid-cols-2 gap-12 items-center">
            {stripImg && (
              <div className="w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stripImg} alt="" className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-6">
              <span className="eyebrow">THE IMPRESSION</span>
              <p className="font-inter text-base small:text-lg italic text-on-surface-variant leading-relaxed">
                {perfume.scent_story}
              </p>
            </div>
          </div>
        </section>
      )}



      {/* ─── OLFACTORY BLUEPRINT ─── */}
      {(perfume?.top_notes ||
        perfume?.middle_notes ||
        perfume?.base_notes ||
        perfume?.usage_tips ||
        perfume?.ingredients ||
        perfume?.occasions) && (
        <section className="py-16 bg-surface-lowest border-t border-surface-variant/20">
          <div className="content-container max-w-[720px]">
            <span className="eyebrow block mb-8">OLFACTORY BLUEPRINT</span>

            {/* Notes row */}
            {(perfume.top_notes || perfume.middle_notes || perfume.base_notes) && (
              <div className="border-t border-surface-variant/30 py-6">
                <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-6">
                  THE NOTES
                </p>
                <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
                  {[
                    { label: "TOP / OPENING", value: perfume.top_notes },
                    { label: "HEART / BODY", value: perfume.middle_notes },
                    { label: "BASE / SOUL", value: perfume.base_notes },
                  ]
                    .filter((n) => n.value)
                    .map((note) => (
                      <div key={note.label}>
                        <span className="font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled block mb-2">
                          {note.label}
                        </span>
                        <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
                          {note.value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Sillage / Longevity */}
            {(perfume?.sillage || perfume?.longevity) && (
              <div className="border-t border-surface-variant/30 py-6">
                <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-4">
                  SILLAGE &amp; LONGEVITY
                </p>
                <PerformanceChart sillage={perfume.sillage} longevity={perfume.longevity} />
              </div>
            )}

            {/* When to Wear */}
            {perfume?.occasions && (
              <div className="border-t border-surface-variant/30 py-6">
                <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-4">
                  WHEN TO WEAR
                </p>
                <div className="flex flex-wrap gap-2">
                  {perfume.occasions.split(",").map((occ: string) => occ.trim()).filter(Boolean).map((occ : string) => {
                    const OCCASION_META: Record<string, { label: string; icon: string }> = {
                      day:     { label: "Day",         icon: "☀" },
                      evening: { label: "Evening",     icon: "🌙" },
                      summer:  { label: "Summer",      icon: "🌿" },
                      winter:  { label: "Winter",      icon: "❄" },
                      rainy:   { label: "Rainy Day",   icon: "🌧" },
                      office:  { label: "Office",      icon: "💼" },
                      date:    { label: "Date Night",  icon: "✦" },
                      gentle:  { label: "Gentle",      icon: "◇" },
                      strong:  { label: "Strong / Bold", icon: "◆" },
                    }
                    const meta = OCCASION_META[occ] ?? { label: occ, icon: "·" }
                    return (
                      <span
                        key={occ}
                        className="inline-flex items-center gap-1.5 font-inter text-[9px] tracking-[0.15em] uppercase bg-surface-low border border-surface-variant/40 text-on-surface-variant px-3 py-2 hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <span className="text-[11px] leading-none">{meta.icon}</span>
                        {meta.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Application */}
            {perfume.usage_tips && (
              <div className="border-t border-surface-variant/30 py-6">
                <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-4">
                  APPLICATION
                </p>
                <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
                  {perfume.usage_tips}
                </p>
              </div>
            )}

            {/* Ingredients */}
            {perfume.ingredients && (
              <div className="border-t border-surface-variant/30 py-6">
                <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-4">
                  INGREDIENTS
                </p>
                <p className="font-inter text-xs text-on-surface-disabled leading-relaxed">
                  {perfume.ingredients}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── ART YOU WEAR ─── */}
      <section className="py-20 bg-surface-container overflow-hidden">
        <div className="content-container grid grid-cols-1 small:grid-cols-2 gap-12 items-center">
          {/* Left: product art image */}
          <div className="aspect-square overflow-hidden bg-surface-low">
            {artImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={artImg} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          {/* Right: copy */}
          <div className="flex flex-col gap-6">
            <h2 className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface leading-[0.95] tracking-[-0.03em]">
              Art you wear.
              <br />
              Scent that speaks.
            </h2>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
              Each Whiff Theory label is a commissioned piece of digital abstract
              art. The artist explored the tension between form and fragrance —
              mirroring the scent&apos;s journey from its sharp, immediate opening
              to its soft, lingering dry-down.
            </p>
            <LocalizedClientLink href="/about">
              <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary hover:opacity-75 transition-opacity cursor-pointer">
                MEET THE ARTIST →
              </span>
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      {/* ─── TIER UPGRADE CTA ─── */}
      {tier?.nextHref && (
        <section className="py-16 bg-surface-lowest">
          <div className="content-container">
            <div className="border border-surface-variant/40 p-8 small:p-12 flex flex-col small:flex-row items-start small:items-center justify-between gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-disabled">
                  {tier.nextBadge}
                </span>
                <h3 className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface tracking-[-0.02em]">
                  Graduate to a Scene Stealer.
                </h3>
                <p className="font-inter text-sm text-on-surface-variant max-w-[440px]">
                  If this is your daily signature, the next step in your
                  olfactory evolution awaits. Discover scents designed to command
                  the room.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <LocalizedClientLink href={tier.nextHref}>
                  <button className="btn-ghost">{tier.nextLabel} →</button>
                </LocalizedClientLink>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── PRODUCT SPECS & SHIPPING ─── */}
      <div className="content-container py-10 max-w-[720px]">
        <ProductTabs product={product} />
      </div>

      {/* ─── REVIEWS ─── */}
      <ProductReviews
        productId={product.id}
        initialReviews={reviewsData.reviews}
        initialStats={reviewsData.stats}
      />

      {/* ─── RELATED PRODUCTS ─── */}
      <div
        className="content-container py-16"
        data-testid="related-products-container"
      >
        <div className="flex flex-col gap-2 mb-10">
          <span className="eyebrow">YOU MAY ALSO LIKE</span>
          <h2 className="section-heading text-2xl">Complete Your Collection</h2>
        </div>
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProductTemplate
