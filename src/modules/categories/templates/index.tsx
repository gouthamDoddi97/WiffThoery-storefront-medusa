import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilteredPaginatedProducts from "@modules/store/templates/filtered-paginated-products"
import CollectionSidebar from "@modules/collections/components/collection-sidebar"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeIn from "@modules/common/components/fade-in"
import { HttpTypes } from "@medusajs/types"
import { getCollectionTiers, CollectionTierMeta } from "@lib/data/collection-tier"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ResolvedMeta = {
  number: string
  tagline: string
  description: string
  accentColor: string
  accentClass: string
  imageUrl?: string | null
  nextTier?: { label: string; href: string; cta: string }
}

function resolveAccentClass(color: string | null | undefined): string {
  if (!color) return "text-primary"
  const c = color.toLowerCase()
  if (c.includes("ffb") || c.includes("ffd")) return "text-tertiary"
  if (c.includes("ff6") || c.includes("ff4")) return "text-secondary"
  return "text-primary"
}

function buildMeta(tier: CollectionTierMeta | undefined, fallback: ResolvedMeta): ResolvedMeta {
  if (!tier) return fallback
  const hasNext = tier.next_tier_label && tier.next_tier_href && tier.next_tier_cta
  return {
    number: tier.tier_number || fallback.number,
    tagline: tier.tagline || fallback.tagline,
    description: tier.description || fallback.description,
    accentColor: tier.accent_color || fallback.accentColor,
    accentClass: tier.accent_color ? resolveAccentClass(tier.accent_color) : fallback.accentClass,
    imageUrl: tier.image_url ?? fallback.imageUrl ?? null,
    nextTier: hasNext
      ? { label: tier.next_tier_label!, href: tier.next_tier_href!, cta: tier.next_tier_cta! }
      : fallback.nextTier,
  }
}

function resolveCategoryImage(
  category: HttpTypes.StoreProductCategory,
  tier: CollectionTierMeta | undefined
): string | null {
  const metadata = (category.metadata ?? {}) as Record<string, unknown>
  const metadataImage =
    (metadata.image_url as string | undefined) ??
    (metadata.imageUrl as string | undefined) ??
    (metadata.hero_image as string | undefined) ??
    (metadata.heroImage as string | undefined) ??
    (metadata.thumbnail as string | undefined)

  return tier?.image_url ?? metadataImage ?? null
}

const FALLBACK_META: Record<string, ResolvedMeta> = {
  "popular": {
    number: "TIER 01 / 03",
    tagline: "Your entry point. Instantly loved.",
    description: "Universally adored, immediately wearable. These fragrances win rooms, open conversations, and leave lasting impressions — without demanding anything from your nose.",
    accentColor: "#4FDBCC",
    accentClass: "text-primary",
    nextTier: { label: "Ready for More?", href: "/categories/unique", cta: "EXPLORE UNIQUE" },
  },
  "unique": {
    number: "TIER 02 / 03",
    tagline: "For the curious nose.",
    description: "Beyond the mainstream. These scents reward attention and develop beautifully over time. Your nose has grown. These fragrances know it.",
    accentColor: "#FFB547",
    accentClass: "text-tertiary",
    nextTier: { label: "Ready for the deepest end?", href: "/categories/idgf", cta: "EXPLORE IDGF" },
  },
  "idgf": {
    number: "TIER 03 / 03",
    tagline: "Not for everyone. Definitely for you.",
    description: "Challenging, unforgettable, unapologetically complex. These fragrances are divisive by design. The ones who get it, get it completely.",
    accentColor: "#FF6B5A",
    accentClass: "text-secondary",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier Journey Stepper
// ─────────────────────────────────────────────────────────────────────────────

const STEPPER_STEPS = [
  { label: "Popular" },
  { label: "Unique" },
  { label: "IDGF" },
]

function TierStepper({ activeIndex }: { activeIndex: 0 | 1 | 2 }) {
  const accentBg = (["bg-primary", "bg-tertiary", "bg-secondary"] as const)[activeIndex]
  const accentBorder = (["border-primary", "border-tertiary", "border-secondary"] as const)[activeIndex]
  const accentText = (["text-primary", "text-tertiary", "text-secondary"] as const)[activeIndex]

  return (
    <div className="flex items-start">
      {STEPPER_STEPS.map((step, i) => {
        const isDone = i < activeIndex
        const isActive = i === activeIndex

        return (
          <div key={step.label} className="flex items-center">
            {i > 0 && (
              <div className={`w-8 small:w-12 h-px mx-2 ${i <= activeIndex ? accentBg : "bg-surface-variant/50"}`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-2 h-2 ${
                  isActive
                    ? accentBg
                    : isDone
                    ? `border ${accentBorder}`
                    : "border border-surface-variant/50"
                }`}
              />
              <span
                className={`font-inter text-[8px] tracking-[0.15em] uppercase whitespace-nowrap ${
                  isActive ? accentText : "text-on-surface-disabled"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared props
// ─────────────────────────────────────────────────────────────────────────────

type FilterProps = {
  longevity: string[]
  sillage: string[]
  notes: string[]
}

type TierProps = {
  category: HttpTypes.StoreProductCategory
  sort: SortOptions
  page: number
  countryCode: string
  meta: ResolvedMeta
  heroImage: string | null
  filters: FilterProps
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared products section (sidebar + grid)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryProductsSection({
  category,
  sort,
  page,
  countryCode,
  layout,
  filters,
}: {
  category: HttpTypes.StoreProductCategory
  sort: SortOptions
  page: number
  countryCode: string
  layout: "default" | "wave" | "s-curve" | "scattered"
  filters: FilterProps
}) {
  return (
    <div className="content-container py-16">
      <h2 className="section-heading text-xl mb-10">THE COLLECTION</h2>
      <div className="flex flex-col small:flex-row small:items-start gap-0 small:gap-12">
        <CollectionSidebar
          sortBy={sort}
          longevity={filters.longevity}
          sillage={filters.sillage}
          notes={filters.notes}
        />
        <div className="flex-1 min-w-0">
          <Suspense
            key={`${sort}-${filters.longevity.join()}-${filters.sillage.join()}-${filters.notes.join()}`}
            fallback={<SkeletonProductGrid numberOfProducts={category.products?.length} />}
          >
            <FilteredPaginatedProducts
              sortBy={sort}
              page={page}
              categoryId={category.id}
              countryCode={countryCode}
              layout={layout}
              longevity={filters.longevity}
              sillage={filters.sillage}
              notes={filters.notes}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 01 — Crowd Pleaser
// ─────────────────────────────────────────────────────────────────────────────

function CrowdPleaserTemplate({ category, sort, page, countryCode, meta, heroImage, filters }: TierProps) {
  return (
    <div className="bg-surface-lowest">
      <div className="relative py-24 small:py-32 bg-surface-low overflow-hidden min-h-[300px] small:min-h-0">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: 0.75 }}
            />
            <div
              className="absolute inset-0 block small:hidden"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.80) 0%, rgba(15,19,28,0.70) 24%, rgba(15,19,28,0.60) 40%, rgba(15,19,28,0.50) 100%)" }}
            />
            <div
              className="absolute inset-0 hidden small:block"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.96) 0%, rgba(15,19,28,0.86) 44%, rgba(15,19,28,0.55) 68%, rgba(15,19,28,0.18) 100%)" }}
            />
          </>
        )}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(79,219,204,0.06) 0%, transparent 70%)" }} />
        <div className="content-container relative z-10">
          <FadeIn className="flex flex-col gap-6 max-w-[700px]">
          <div className="flex items-center gap-2">
            <LocalizedClientLink href="/" className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors">HOME</LocalizedClientLink>
            <span className="text-on-surface-disabled text-[10px]">/</span>
            <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-primary">{category.name}</span>
          </div>
          <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-primary">{meta.number}</span>
          <TierStepper activeIndex={0} />
          <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">{category.name}</h1>
          <p className="font-inter text-lg italic text-primary">{meta.tagline}</p>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">{meta.description}</p>
          <div className="w-16 h-[2px] bg-primary" />
          </FadeIn>
        </div>
      </div>
      <CategoryProductsSection category={category} sort={sort} page={page} countryCode={countryCode} layout="s-curve" filters={filters} />
      {meta.nextTier && (
        <div className="bg-surface-low py-16">
          <FadeIn className="content-container flex flex-col small:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">THE JOURNEY</span>
              <h3 className="section-heading text-2xl">{meta.nextTier.label}</h3>
              <p className="font-inter text-sm text-on-surface-variant">Your nose is ready for the next level.</p>
            </div>
            <LocalizedClientLink href={meta.nextTier.href}>
              <button className="btn-ghost flex-shrink-0">{meta.nextTier.cta} →</button>
            </LocalizedClientLink>
          </FadeIn>
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 02 — Intro to Niche
// ─────────────────────────────────────────────────────────────────────────────

function IntroToNicheTemplate({ category, sort, page, countryCode, meta, heroImage, filters }: TierProps) {
  return (
    <div className="bg-surface-lowest">
      <div className="relative py-24 small:py-32 overflow-hidden bg-surface-low min-h-[300px] small:min-h-0">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: 0.75 }}
            />
            <div
              className="absolute inset-0 block small:hidden"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.80) 0%, rgba(15,19,28,0.70) 24%, rgba(15,19,28,0.60) 40%, rgba(15,19,28,0.50) 100%)" }}
            />
            <div
              className="absolute inset-0 hidden small:block"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.96) 0%, rgba(15,19,28,0.86) 44%, rgba(15,19,28,0.55) 68%, rgba(15,19,28,0.18) 100%)" }}
            />
          </>
        )}
        <div className="content-container relative z-10">
          <FadeIn className="flex flex-col gap-6 max-w-[700px]">
          <div className="flex items-center gap-2">
            <LocalizedClientLink href="/" className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors">HOME</LocalizedClientLink>
            <span className="text-on-surface-disabled text-[10px]">/</span>
            <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-tertiary">{category.name}</span>
          </div>
          <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-tertiary">{meta.number}</span>
          <TierStepper activeIndex={1} />
          <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">{category.name}</h1>
          <p className="font-inter text-lg italic text-tertiary">{meta.tagline}</p>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">{meta.description}</p>
          <div className="w-16 h-[2px] bg-tertiary" />
          </FadeIn>
        </div>
      </div>
      <CategoryProductsSection category={category} sort={sort} page={page} countryCode={countryCode} layout="s-curve" filters={filters} />
      <FadeIn>
      <div className="bg-surface-low py-16">
        <div className="content-container max-w-[600px]">
          <p className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface italic leading-[1.2] tracking-[-0.02em]">"I didn't know fragrance could feel like this."</p>
          <span className="block mt-4 font-inter text-xs tracking-[0.2em] uppercase text-on-surface-variant">— Whiff Theory Community</span>
        </div>
      </div>
      </FadeIn>
      {meta.nextTier && (
        <FadeIn>
        <div className="content-container py-16 flex flex-col small:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">THE FINAL FRONTIER</span>
            <h3 className="section-heading text-2xl">{meta.nextTier.label}</h3>
            <p className="font-inter text-sm text-on-surface-variant">Some scents are made for the few.</p>
          </div>
          <LocalizedClientLink href={meta.nextTier.href}>
            <button className="btn-primary flex-shrink-0">{meta.nextTier.cta} →</button>
          </LocalizedClientLink>
        </div>
        </FadeIn>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 03 — Polarizing Art
// ─────────────────────────────────────────────────────────────────────────────

function PolarizingArtTemplate({ category, sort, page, countryCode, meta, heroImage, filters }: TierProps) {
  return (
    <div className="bg-surface-lowest">
      <div className="relative py-28 small:py-40 bg-surface-container overflow-hidden min-h-[300px] small:min-h-0">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: 0.75 }}
            />
            <div
              className="absolute inset-0 block small:hidden"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.80) 0%, rgba(15,19,28,0.70) 24%, rgba(15,19,28,0.60) 40%, rgba(15,19,28,0.50) 100%)" }}
            />
            <div
              className="absolute inset-0 hidden small:block"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.97) 0%, rgba(15,19,28,0.86) 44%, rgba(15,19,28,0.52) 68%, rgba(15,19,28,0.15) 100%)" }}
            />
          </>
        )}
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] pointer-events-none" style={{ background: "radial-gradient(ellipse at bottom right, rgba(255,107,90,0.08) 0%, transparent 65%)" }} />
        <div className="content-container relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <LocalizedClientLink href="/" className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors">HOME</LocalizedClientLink>
            <span className="text-on-surface-disabled text-[10px]">/</span>
            <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-secondary">IDGF</span>
          </div>
          <FadeIn className="flex flex-col gap-6 max-w-[700px]">
            <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-secondary">{meta.number}</span>
            <TierStepper activeIndex={2} />
            <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">{category.name}</h1>
            <p className="font-inter text-lg italic text-secondary">{meta.tagline}</p>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">{meta.description}</p>
            <div className="w-16 h-[2px] bg-secondary" />
          </FadeIn>
        </div>
      </div>
      <CategoryProductsSection category={category} sort={sort} page={page} countryCode={countryCode} layout="s-curve" filters={filters} />
      <FadeIn>
      <div className="bg-surface-container py-16">
        <div className="content-container max-w-[640px]">
          <span className="eyebrow mb-4 block">THE CURATOR'S NOTE</span>
          <p className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface italic leading-[1.2] tracking-[-0.02em]">"These aren't for everyone. That's exactly the point. Art that polarizes is art that matters."</p>
          <span className="block mt-6 font-inter text-xs tracking-[0.2em] uppercase text-on-surface-variant">— Founder, Whiff Theory</span>
        </div>
      </div>
      </FadeIn>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic fallback
// ─────────────────────────────────────────────────────────────────────────────

function GenericCategoryTemplate({
  category,
  sort,
  page,
  countryCode,
  heroImage,
  filters,
}: Omit<TierProps, "meta">) {
  return (
    <div className="bg-surface-lowest">
      <div className="relative bg-surface-low py-16 overflow-hidden min-h-[200px] small:min-h-0">
        {heroImage && (
          <>
            <img
              src={heroImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ opacity: 0.75 }}
            />
            <div
              className="absolute inset-0 block small:hidden"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.80) 0%, rgba(15,19,28,0.70) 24%, rgba(15,19,28,0.60) 40%, rgba(15,19,28,0.50) 100%)" }}
            />
            <div
              className="absolute inset-0 hidden small:block"
              style={{ background: "linear-gradient(90deg, rgba(15,19,28,0.95) 0%, rgba(15,19,28,0.82) 44%, rgba(15,19,28,0.48) 68%, rgba(15,19,28,0.12) 100%)" }}
            />
          </>
        )}
        <div className="content-container relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <LocalizedClientLink href="/" className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors">HOME</LocalizedClientLink>
            <span className="text-on-surface-disabled text-[10px]">/</span>
            <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-primary">{category.name}</span>
          </div>
          <h1 className="section-heading text-4xl small:text-5xl">{category.name}</h1>
          {category.description && <p className="font-inter text-sm text-on-surface-variant mt-4 max-w-[600px]">{category.description}</p>}
        </div>
      </div>
      <CategoryProductsSection category={category} sort={sort} page={page} countryCode={countryCode} layout="default" filters={filters} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — async, fetches tier meta, dispatches to sub-template
// ─────────────────────────────────────────────────────────────────────────────

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  longevity = [],
  sillage = [],
  notes = [],
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  longevity?: string[]
  sillage?: string[]
  notes?: string[]
}) {
  if (!category || !countryCode) notFound()

  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const handle = category.handle ?? ""
  const filters: FilterProps = { longevity, sillage, notes }

  const tierMap = await getCollectionTiers()
  const heroImage = resolveCategoryImage(category, tierMap[handle])

  if (handle === "popular") {
    return <CrowdPleaserTemplate category={category} sort={sort} page={pageNumber} countryCode={countryCode} meta={buildMeta(tierMap[handle], FALLBACK_META["popular"])} heroImage={heroImage} filters={filters} />
  }
  if (handle === "unique") {
    return <IntroToNicheTemplate category={category} sort={sort} page={pageNumber} countryCode={countryCode} meta={buildMeta(tierMap[handle], FALLBACK_META["unique"])} heroImage={heroImage} filters={filters} />
  }
  if (handle === "idgf") {
    return <PolarizingArtTemplate category={category} sort={sort} page={pageNumber} countryCode={countryCode} meta={buildMeta(tierMap[handle], FALLBACK_META["idgf"])} heroImage={heroImage} filters={filters} />
  }

  return <GenericCategoryTemplate category={category} sort={sort} page={pageNumber} countryCode={countryCode} heroImage={heroImage} filters={filters} />
}
