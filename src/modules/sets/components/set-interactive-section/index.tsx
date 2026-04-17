"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ImageCarousel from "@modules/products/components/image-carousel"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FragranceSet, SetItem } from "@lib/data/offers"
import { PerfumeDetails } from "types/perfume"
import AddSetToCartButton from "@modules/sets/components/add-set-to-cart-button"

// ── types ────────────────────────────────────────────────────────────────────

export type EnrichedSetItem = {
  item: SetItem
  product: HttpTypes.StoreProduct | null
  details: PerfumeDetails | null
  variantPrice: string | null
  variantImages: { id: string; url: string }[]
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100)
  } catch {
    return `${currencyCode.toUpperCase()} ${amount / 100}`
  }
}

function NoteChip({ label, values }: { label: string; values: string }) {
  const list = values
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 3)
  if (!list.length) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="font-inter text-[8px] tracking-[0.22em] uppercase text-on-surface-disabled">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {list.map((v) => (
          <span
            key={v}
            className="font-inter text-[9px] text-on-surface-variant border border-surface-variant/50 px-2 py-0.5"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  )
}

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-surface-variant/40 py-6">
      <p className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled mb-3">
        {label}
      </p>
      <div className="font-inter text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function SetInteractiveSection({
  set,
  enrichedItems,
  countryCode,
}: {
  set: FragranceSet
  enrichedItems: EnrichedSetItem[]
  countryCode: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Build carousel images: one per item, using first variantImage or thumbnail
  const images = enrichedItems.map((ei) => {
    const url = ei.variantImages[0]?.url ?? ei.item.thumbnail ?? ""
    return { url, alt: ei.item.product_title }
  }).filter((img) => !!img.url)

  const tagList = set.tags
    ? set.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

  const activeItem = enrichedItems[activeIndex]

  return (
    <>
      {/* ── 2-col main grid ── */}
      <div className="grid grid-cols-1 small:grid-cols-2 gap-10 small:gap-16 pt-6">

        {/* ── LEFT: carousel + thumbnail strip ── */}
        <div className="sticky top-20 self-start">
          {images.length > 0 ? (
            <ImageCarousel
              images={images}
              activeIndex={activeIndex}
              onActiveChange={setActiveIndex}
            />
          ) : (
            <div className="aspect-[3/4] bg-surface-container" />
          )}

          {/* Thumbnail strip — each clicks to activate that product */}
          {enrichedItems.length > 1 && (
            <div className="mt-5 flex flex-col gap-2">
              {enrichedItems.map((ei, i) => (
                <button
                  key={ei.item.variant_id}
                  onClick={() => setActiveIndex(i)}
                  className={`flex items-center gap-3 border px-3 py-2 text-left transition-colors duration-200 ${
                    i === activeIndex
                      ? "border-primary/50 bg-surface-container"
                      : "border-surface-variant/40 hover:border-surface-variant/80"
                  }`}
                >
                  {ei.item.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ei.variantImages[0]?.url ?? ei.item.thumbnail}
                      alt={ei.item.product_title}
                      className="w-10 h-10 object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-garamond italic text-on-surface text-base leading-tight">
                      {ei.item.product_title}
                    </p>
                    <p className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled mt-0.5">
                      {ei.item.variant_title}
                    </p>
                  </div>
                  {i === activeIndex && (
                    <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: set info + active product panel ── */}
        <div className="flex flex-col">

          {/* badge + tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {set.badge && (
              <span className="font-inter text-[8px] tracking-[0.22em] uppercase text-primary border border-primary/30 px-2 py-0.5">
                {set.badge}
              </span>
            )}
            {tagList.map((tag) => (
              <span
                key={tag}
                className="font-inter text-[8px] tracking-[0.18em] uppercase text-on-surface-disabled border border-surface-variant/60 px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* set title */}
          <h1
            className="font-garamond italic text-on-surface leading-[1.1]"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            {set.title}
          </h1>

          {/* set description */}
          {set.description && (
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed mt-4">
              {set.description}
            </p>
          )}

          {/* set price */}
          <div className="mt-6 pt-5 border-t border-surface-variant/40">
            <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled mb-1">
              Set Price
            </p>
            <span className="font-grotesk font-semibold text-2xl text-primary">
              {formatPrice(set.price_amount, set.currency_code)}
            </span>
          </div>

          {/* ── Active product spotlight ── */}
          {activeItem && (
            <div className="mt-6 border-t border-surface-variant/40 pt-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
                  Now Viewing
                </p>
                {activeItem.variantPrice && (
                  <span className="font-grotesk text-sm text-on-surface-variant">
                    {activeItem.variantPrice}
                  </span>
                )}
              </div>

              <h2
                className="font-garamond italic text-on-surface leading-tight mb-1"
                style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)" }}
              >
                {activeItem.item.product_title}
              </h2>
              <p className="font-inter text-[9px] tracking-[0.18em] uppercase text-on-surface-disabled mb-4">
                {activeItem.item.variant_title}
              </p>

              {/* Scent story or fallback to product description */}
              {(activeItem.details?.scent_story || activeItem.product?.description) && (
                <p className="font-garamond italic text-base text-on-surface-variant leading-relaxed mb-5">
                  {activeItem.details?.scent_story ?? activeItem.product?.description}
                </p>
              )}

              {/* Notes grid */}
              {(activeItem.details?.top_notes || activeItem.details?.middle_notes || activeItem.details?.base_notes) && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {activeItem.details.top_notes && (
                    <NoteChip label="Top" values={activeItem.details.top_notes} />
                  )}
                  {activeItem.details.middle_notes && (
                    <NoteChip label="Heart" values={activeItem.details.middle_notes} />
                  )}
                  {activeItem.details.base_notes && (
                    <NoteChip label="Base" values={activeItem.details.base_notes} />
                  )}
                </div>
              )}

              {/* Longevity / sillage */}
              {(activeItem.details?.longevity || activeItem.details?.sillage) && (
                <div className="flex gap-6 mb-5">
                  {activeItem.details.longevity && (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[8px] tracking-[0.2em] uppercase text-on-surface-disabled">Longevity</span>
                      <span className="font-inter text-xs text-on-surface-variant">{activeItem.details.longevity}</span>
                    </div>
                  )}
                  {activeItem.details.sillage && (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-inter text-[8px] tracking-[0.2em] uppercase text-on-surface-disabled">Sillage</span>
                      <span className="font-inter text-xs text-on-surface-variant">{activeItem.details.sillage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Link to full product page */}
              {activeItem.product?.handle && (
                <LocalizedClientLink
                  href={`/products/${activeItem.product.handle}`}
                  className="inline-flex items-center gap-2 font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled hover:text-on-surface transition-colors duration-200"
                >
                  <span>Full details</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </LocalizedClientLink>
              )}
            </div>
          )}

          {/* set-level info sections */}
          {set.usage_tips && <InfoSection label="Usage Tips">{set.usage_tips}</InfoSection>}
          {set.ingredients && <InfoSection label="Ingredients">{set.ingredients}</InfoSection>}
          {set.brand_info && <InfoSection label="Brand & Manufacturer">{set.brand_info}</InfoSection>}
        </div>
      </div>

      {/* ── COMPLETE SET SHOWCASE ── */}
      <section className="mt-16 border-t border-surface-variant/20 pt-12 pb-8">
        <div className="flex flex-col gap-1 mb-8">
          <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled">
            What You're Getting
          </span>
          <h2 className="font-garamond italic text-on-surface" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            Every piece, included in one set.
          </h2>
          <p className="font-inter text-sm text-on-surface-variant mt-1 max-w-md">
            When you order this set, all {enrichedItems.length} fragrances below are included — no separate purchases needed.
          </p>
        </div>

        {/* Product cards in a row */}
        <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
          {enrichedItems.map((ei, i) => (
            <div
              key={ei.item.variant_id}
              className={`flex items-center gap-3 border px-3 py-3 transition-colors duration-200 cursor-pointer ${
                i === activeIndex
                  ? "border-primary/50 bg-surface-container"
                  : "border-surface-variant/40 hover:border-surface-variant/80"
              }`}
              onClick={() => {
                setActiveIndex(i)
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              {/* small thumbnail */}
              <div className="w-14 h-14 shrink-0 overflow-hidden bg-transparent">
                {(ei.variantImages[0]?.url || ei.item.thumbnail) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ei.variantImages[0]?.url ?? ei.item.thumbnail!}
                    alt={ei.item.product_title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high" />
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <p className="font-garamond italic text-on-surface text-base leading-tight">
                  {ei.item.product_title}
                </p>
                <p className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled">
                  {ei.item.variant_title}
                </p>
                {ei.variantPrice && (
                  <p className="font-grotesk text-xs text-on-surface-variant">
                    {ei.variantPrice} <span className="text-on-surface-disabled font-inter font-normal text-[9px]">individually</span>
                  </p>
                )}
              </div>

              {i === activeIndex && (
                <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Total + CTA */}
        <div className="mt-8 flex flex-col small:flex-row small:items-center gap-4 small:gap-8 pt-6 border-t border-surface-variant/20">
          <div className="flex flex-col gap-0.5">
            <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
              Set Price — All {enrichedItems.length} Included
            </span>
            <span className="font-grotesk font-semibold text-3xl text-primary">
              {formatPrice(set.price_amount, set.currency_code)}
            </span>
          </div>

          <AddSetToCartButton
            items={set.items}
            className="small:ml-auto flex items-center justify-center py-3 px-8 bg-tertiary text-surface-lowest font-inter text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-tertiary/90 disabled:opacity-60 transition-colors duration-200"
          />
        </div>

        {/* trust badges */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
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
      </section>
    </>
  )
}
