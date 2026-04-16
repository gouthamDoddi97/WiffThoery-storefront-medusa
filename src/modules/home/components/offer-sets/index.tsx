import { getActiveOffers, FragranceSet } from "@lib/data/offers"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

function SetCard({ set }: { set: FragranceSet }) {
  const thumbs = set.items.map((i) => i.thumbnail).filter(Boolean).slice(0, 2)

  return (
    <LocalizedClientLink
      href={`/sets/${set.id}`}
      className="relative flex flex-col bg-surface-container border border-surface-variant/40 overflow-hidden w-[280px] small:w-[320px] shrink-0 snap-start hover:border-on-surface/20 transition-colors duration-300"
    >
      {/* badge */}
      {set.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="font-inter text-[8px] tracking-[0.22em] uppercase text-primary bg-surface-lowest/80 px-2 py-0.5 backdrop-blur-sm">
            {set.badge}
          </span>
        </div>
      )}

      {/* thumbnails */}
      <div className="flex h-48 overflow-hidden">
        {thumbs.length === 0 && (
          <div className="flex-1 bg-surface-container-high" />
        )}
        {thumbs.map((src, i) => (
          <div key={i} className="flex-1 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src!}
              alt={set.items[i]?.product_title ?? ""}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* info */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-garamond italic text-xl text-on-surface leading-tight">
          {set.title}
        </h3>

        {set.description && (
          <p className="font-inter text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
            {set.description}
          </p>
        )}

        {/* items list */}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {set.items.map((item) => (
            <div key={item.variant_id} className="flex items-center gap-1.5">
              <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled">
                {item.product_title}
              </span>
              <span className="text-on-surface-disabled text-[9px]">·</span>
              <span className="font-inter text-[9px] text-on-surface-disabled">
                {item.variant_title}
              </span>
            </div>
          ))}
        </div>

        {/* price + cta */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-surface-variant/40">
          <span className="font-grotesk font-semibold text-base text-primary">
            {formatPrice(set.price_amount, set.currency_code)}
          </span>
          <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface border border-on-surface/30 px-3 py-1.5">
            View Set
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default async function OfferSets() {
  const sets = await getActiveOffers()

  if (!sets.length) return null

  return (
    <section className="bg-surface-lowest border-b border-surface-variant/30 py-6 overflow-hidden">
      <div className="content-container">
        {/* header row */}
        <div className="flex items-center gap-4 mb-4">
          <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-tertiary">
            Fragrance Sets
          </span>
          <div className="flex-1 h-px bg-surface-variant/40" />
        </div>

        {/* horizontally scrollable cards */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide -mx-4 px-4 small:-mx-6 small:px-6">
          {sets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      </div>
    </section>
  )
}
