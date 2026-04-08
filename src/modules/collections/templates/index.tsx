import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  getCollectionTiers,
  CollectionTierMeta,
} from "@lib/data/collection-tier"

// ─────────────────────────────────────────────────────────────────────────────
// Resolved tier meta type (after falling back to defaults)
// ─────────────────────────────────────────────────────────────────────────────

type ResolvedMeta = {
  number: string
  tagline: string
  description: string
  accentColor: string
  accentClass: string
  nextTier?: { label: string; href: string; cta: string }
}

function resolveAccentClass(color: string | null | undefined): string {
  if (!color) return "text-primary"
  if (color.toLowerCase().includes("ffb") || color.toLowerCase().includes("ffd"))
    return "text-tertiary"
  if (color.toLowerCase().includes("ff6") || color.toLowerCase().includes("ff4"))
    return "text-secondary"
  return "text-primary"
}

function buildMeta(
  tier: CollectionTierMeta | undefined,
  fallback: ResolvedMeta
): ResolvedMeta {
  if (!tier) return fallback
  const hasNext =
    tier.next_tier_label && tier.next_tier_href && tier.next_tier_cta
  return {
    number: tier.tier_number || fallback.number,
    tagline: tier.tagline || fallback.tagline,
    description: tier.description || fallback.description,
    accentColor: tier.accent_color || fallback.accentColor,
    accentClass: tier.accent_color
      ? resolveAccentClass(tier.accent_color)
      : fallback.accentClass,
    nextTier: hasNext
      ? {
          label: tier.next_tier_label!,
          href: tier.next_tier_href!,
          cta: tier.next_tier_cta!,
        }
      : fallback.nextTier,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Static fallbacks (used when admin hasn't populated the data yet)
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_META: Record<string, ResolvedMeta> = {
  "popular": {
    number: "TIER 01 / 03",
    tagline: "Your entry point. Instantly loved.",
    description:
      "Universally adored, immediately wearable. These fragrances win rooms, open conversations, and leave lasting impressions — without demanding anything from your nose.",
    accentColor: "#4FDBCC",
    accentClass: "text-primary",
    nextTier: {
      label: "Ready for More?",
      href: "/collections/unique",
      cta: "EXPLORE UNIQUE",
    },
  },
  "unique": {
    number: "TIER 02 / 03",
    tagline: "For the curious nose.",
    description:
      "Beyond the mainstream. These scents reward attention and develop beautifully over time. Your nose has grown. These fragrances know it.",
    accentColor: "#FFB547",
    accentClass: "text-tertiary",
    nextTier: {
      label: "Ready for the deepest end?",
      href: "/collections/idgf",
      cta: "EXPLORE IDGF",
    },
  },
  "idgf": {
    number: "TIER 03 / 03",
    tagline: "Not for everyone. Definitely for you.",
    description:
      "Challenging, unforgettable, unapologetically complex. These fragrances are divisive by design. The ones who get it, get it completely.",
    accentColor: "#FF6B5A",
    accentClass: "text-secondary",
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic fallback template
// ─────────────────────────────────────────────────────────────────────────────

function GenericCollectionTemplate({
  collection,
  sort,
  page,
  countryCode,
}: {
  collection: HttpTypes.StoreCollection
  sort: SortOptions
  page: number
  countryCode: string
}) {
  return (
    <div className="bg-surface-lowest">
      {/* Header */}
      <div className="bg-surface-low py-16">
        <div className="content-container">
          <h1 className="section-heading text-4xl small:text-5xl">
            {collection.title}
          </h1>
        </div>
      </div>
      {/* Products */}
      <div className="content-container py-12 flex flex-col small:flex-row small:items-start gap-8">
        <RefinementList sortBy={sort} />
        <div className="flex-1">
          <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
            <PaginatedProducts
              sortBy={sort}
              page={page}
              collectionId={collection.id}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Crowd Pleasers template (Tier 01)
// ─────────────────────────────────────────────────────────────────────────────

function CrowdPleasersTemplate({
  collection,
  sort,
  page,
  countryCode,
  meta,
}: {
  collection: HttpTypes.StoreCollection
  sort: SortOptions
  page: number
  countryCode: string
  meta: ResolvedMeta
}) {
  return (
    <div className="bg-surface-lowest">
      {/* Hero */}
      <div
        className="relative py-24 small:py-32 bg-surface-low overflow-hidden"
      >
        {/* Teal ambient glow */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(79,219,204,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="content-container relative z-10 flex flex-col gap-6 max-w-[700px]">
          {/* Tier badge */}
          <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-primary">
            {meta.number}
          </span>
          <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">
            {collection.title}
          </h1>
          <p className="font-inter text-lg italic text-primary">{meta.tagline}</p>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">
            {meta.description}
          </p>
          {/* Accent bar */}
          <div className="w-16 h-[2px] bg-primary" />
        </div>
      </div>

      {/* Products */}
      <div className="content-container py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-heading text-xl">THE COLLECTION</h2>
          <RefinementList sortBy={sort} />
        </div>
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
          <PaginatedProducts
            sortBy={sort}
            page={page}
            collectionId={collection.id}
            countryCode={countryCode}
            layout="wave"
          />
        </Suspense>
      </div>

      {/* Next tier CTA */}
      {meta.nextTier && (
        <div className="bg-surface-low py-16">
          <div className="content-container flex flex-col small:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">THE JOURNEY</span>
              <h3 className="section-heading text-2xl">{meta.nextTier.label}</h3>
              <p className="font-inter text-sm text-on-surface-variant">
                Your nose is ready for the next level.
              </p>
            </div>
            <LocalizedClientLink href={meta.nextTier.href}>
              <button className="btn-ghost flex-shrink-0">{meta.nextTier.cta} →</button>
            </LocalizedClientLink>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Intro to Niche template (Tier 02)
// ─────────────────────────────────────────────────────────────────────────────

function IntroToNicheTemplate({
  collection,
  sort,
  page,
  countryCode,
  meta,
}: {
  collection: HttpTypes.StoreCollection
  sort: SortOptions
  page: number
  countryCode: string
  meta: ResolvedMeta
}) {

  return (
    <div className="bg-surface-lowest">
      {/* Hero */}
      <div className="relative py-24 small:py-32 overflow-hidden bg-surface-low">
        {/* Gold/amber ambient glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(255,181,71,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="content-container relative z-10 flex flex-col gap-6 max-w-[700px]">
          <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-tertiary">
            {meta.number}
          </span>
          {/* Journey stepper */}
          <div className="flex items-center gap-3">
            {[
              { label: "Popular", done: true },
              { label: "Unique", active: true },
              { label: "IDGF", done: false },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                {i > 0 && (
                  <div className={`w-8 h-px ${step.done || step.active ? "bg-tertiary" : "bg-surface-variant"}`} />
                )}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2 h-2 ${
                      step.active
                        ? "bg-tertiary"
                        : step.done
                        ? "border border-tertiary"
                        : "border border-surface-variant"
                    }`}
                  />
                  <span
                    className={`font-inter text-[9px] tracking-[0.15em] uppercase ${
                      step.active ? "text-tertiary" : "text-on-surface-disabled"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">
            {collection.title}
          </h1>
          <p className="font-inter text-lg italic text-tertiary">{meta.tagline}</p>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">
            {meta.description}
          </p>
          <div className="w-16 h-[2px] bg-tertiary" />
        </div>
      </div>

      {/* Products */}
      <div className="content-container py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-heading text-xl">THE COLLECTION</h2>
          <RefinementList sortBy={sort} />
        </div>
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
          <PaginatedProducts
            sortBy={sort}
            page={page}
            collectionId={collection.id}
            countryCode={countryCode}
            layout="s-curve"
          />
        </Suspense>
      </div>

      {/* Pull quote */}
      <div className="bg-surface-low py-16">
        <div className="content-container max-w-[600px]">
          <p className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface italic leading-[1.2] tracking-[-0.02em]">
            "I didn't know fragrance could feel like this."
          </p>
          <span className="block mt-4 font-inter text-xs tracking-[0.2em] uppercase text-on-surface-variant">
            — Whiff Theory Community
          </span>
        </div>
      </div>

      {/* Next tier CTA */}
      {meta.nextTier && (
        <div className="content-container py-16 flex flex-col small:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">THE FINAL FRONTIER</span>
            <h3 className="section-heading text-2xl">{meta.nextTier.label}</h3>
            <p className="font-inter text-sm text-on-surface-variant">
              Some scents are made for the few.
            </p>
          </div>
          <LocalizedClientLink href={meta.nextTier.href}>
            <button className="btn-primary flex-shrink-0">{meta.nextTier.cta} →</button>
          </LocalizedClientLink>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Polarizing Art template (Tier 03)
// ─────────────────────────────────────────────────────────────────────────────

function PolarizingArtTemplate({
  collection,
  sort,
  page,
  countryCode,
  meta,
}: {
  collection: HttpTypes.StoreCollection
  sort: SortOptions
  page: number
  countryCode: string
  meta: ResolvedMeta
}) {

  return (
    <div className="bg-surface-lowest">
      {/* Hero — dramatic dark */}
      <div className="relative py-28 small:py-40 bg-surface-container overflow-hidden">
        {/* Coral glow */}
        <div
          className="absolute bottom-0 right-0 w-[700px] h-[700px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom right, rgba(255,107,90,0.08) 0%, transparent 65%)",
          }}
        />
        <div className="content-container relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-10">
            <LocalizedClientLink
              href="/"
              className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors"
            >
              HOME
            </LocalizedClientLink>
            <span className="text-on-surface-disabled text-[10px]">/</span>
            <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-secondary">
              IDGF
            </span>
          </div>

          <div className="flex flex-col gap-6 max-w-[700px]">
            <span className="font-inter text-[11px] tracking-[0.25em] uppercase text-secondary">
              {meta.number}
            </span>
            <h1 className="font-grotesk font-bold text-5xl small:text-7xl text-on-surface tracking-[-0.03em] leading-[0.9]">
              {collection.title}
            </h1>
            <p className="font-inter text-lg italic text-secondary">{meta.tagline}</p>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[500px]">
              {meta.description}
            </p>
            <div className="w-16 h-[2px] bg-secondary" />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="content-container py-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="section-heading text-xl">THE COLLECTION</h2>
          <RefinementList sortBy={sort} />
        </div>
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
          <PaginatedProducts
            sortBy={sort}
            page={page}
            collectionId={collection.id}
            countryCode={countryCode}
            layout="scattered"
          />
        </Suspense>
      </div>

      {/* Curator's Note */}
      <div className="bg-surface-container py-16">
        <div className="content-container max-w-[640px]">
          <span className="eyebrow mb-4 block">THE CURATOR'S NOTE</span>
          <p className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface italic leading-[1.2] tracking-[-0.02em]">
            "These aren't for everyone. That's exactly the point. Art that polarizes is art that matters."
          </p>
          <span className="block mt-6 font-inter text-xs tracking-[0.2em] uppercase text-on-surface-variant">
            — Founder, Whiff Theory
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main router — dispatches to the right sub-template
// ─────────────────────────────────────────────────────────────────────────────

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const handle = collection.handle ?? ""

  const tierMap = await getCollectionTiers()

  if (handle === "popular") {
    return (
      <CrowdPleasersTemplate
        collection={collection}
        sort={sort}
        page={pageNumber}
        countryCode={countryCode}
        meta={buildMeta(tierMap[handle], FALLBACK_META["popular"])}
      />
    )
  }

  if (handle === "unique") {
    return (
      <IntroToNicheTemplate
        collection={collection}
        sort={sort}
        page={pageNumber}
        countryCode={countryCode}
        meta={buildMeta(tierMap[handle], FALLBACK_META["unique"])}
      />
    )
  }

  if (handle === "idgf") {
    return (
      <PolarizingArtTemplate
        collection={collection}
        sort={sort}
        page={pageNumber}
        countryCode={countryCode}
        meta={buildMeta(tierMap[handle], FALLBACK_META["idgf"])}
      />
    )
  }

  return (
    <GenericCollectionTemplate
      collection={collection}
      sort={sort}
      page={pageNumber}
      countryCode={countryCode}
    />
  )
}
