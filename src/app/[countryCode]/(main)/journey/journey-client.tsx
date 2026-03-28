"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  customer: HttpTypes.StoreCustomer
  orders: HttpTypes.StoreOrder[]
}

// Derive tier from collection title/handle heuristics
function inferTier(item: HttpTypes.StoreOrderLineItem): "crowd-pleasers" | "intro-to-niche" | "polarizing-art" | "unknown" {
  const handle = (item.product as any)?.collection?.handle ?? ""
  const title = (item.product as any)?.collection?.title ?? ""
  const text = (handle + title).toLowerCase()
  if (text.includes("crowd")) return "crowd-pleasers"
  if (text.includes("intro") || text.includes("niche")) return "intro-to-niche"
  if (text.includes("polariz") || text.includes("art")) return "polarizing-art"
  return "unknown"
}

const TIER_META = {
  "crowd-pleasers": { label: "CROWD PLEASERS", color: "#4FDBCC", desc: "The universally loved" },
  "intro-to-niche": { label: "INTRO TO NICHE", color: "#D4AF37", desc: "The curious explorer" },
  "polarizing-art": { label: "POLARIZING ART", color: "#FF6B6B", desc: "The daring connoisseur" },
  unknown: { label: "ARCHIVE", color: "#7B7FA6", desc: "Mixed collection" },
}

function buildJourneyData(orders: HttpTypes.StoreOrder[]) {
  const tierCounts: Record<string, number> = {
    "crowd-pleasers": 0,
    "intro-to-niche": 0,
    "polarizing-art": 0,
    unknown: 0,
  }
  const timeline: Array<{
    date: string
    productTitle: string
    handle: string
    tier: string
    thumbnail: string | null
  }> = []

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const tier = inferTier(item)
      tierCounts[tier] = (tierCounts[tier] ?? 0) + (item.quantity ?? 1)
      timeline.push({
        date: String(order.created_at),
        productTitle: item.product_title ?? "Unknown",
        handle: item.product_handle ?? "",
        tier,
        thumbnail: item.thumbnail ?? null,
      })
    }
  }

  const total = Object.values(tierCounts).reduce((a, b) => a + b, 0)

  // Determine persona
  let persona = "The Beginner"
  let personaDesc = "Just starting your olfactory journey."
  if (total === 0) {
    persona = "The Unscented"
    personaDesc = "Your journey hasn't begun yet."
  } else if (tierCounts["polarizing-art"] >= 2) {
    persona = "The Connoisseur"
    personaDesc = "You live at the edge of olfactory art."
  } else if (tierCounts["intro-to-niche"] >= 2) {
    persona = "The Explorer"
    personaDesc = "Curiosity is your compass."
  } else if (tierCounts["crowd-pleasers"] >= 2) {
    persona = "The Crowd Pleaser"
    personaDesc = "You wear what works — confidently."
  }

  return { tierCounts, total, timeline: timeline.slice(0, 10), persona, personaDesc }
}

export default function JourneyClient({ customer, orders }: Props) {
  const { tierCounts, total, timeline, persona, personaDesc } = buildJourneyData(orders)

  // What's next suggestion
  const nextTier =
    tierCounts["crowd-pleasers"] > 0 && tierCounts["intro-to-niche"] === 0
      ? { label: "INTRO TO NICHE", href: "/categories/intro-to-niche", color: "#D4AF37" }
      : tierCounts["intro-to-niche"] > 0 && tierCounts["polarizing-art"] === 0
      ? { label: "POLARIZING ART", href: "/categories/polarizing-art", color: "#FF6B6B" }
      : null

  return (
    <div className="bg-surface-lowest min-h-screen py-16">
      <div className="content-container flex flex-col gap-16">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <span className="eyebrow">YOUR EVOLUTION</span>
          <h1 className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface tracking-[-0.02em]">
            MY SCENT JOURNEY
          </h1>
          <p className="font-inter text-sm text-on-surface-variant">
            Welcome back, {customer.first_name}.
          </p>
        </div>

        {total === 0 ? (
          /* Empty state */
          <div className="flex flex-col gap-6 py-16 max-w-[480px]">
            <div className="w-1 h-12 bg-primary" />
            <h2 className="font-grotesk font-bold text-2xl text-on-surface">
              Your journey is blank.
            </h2>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
              Every fragrance you purchase shapes your olfactory persona. Place your first order to
              see your journey mapped here.
            </p>
            <LocalizedClientLink href="/categories/crowd-pleaser">
              <button className="btn-primary">START WITH CROWD PLEASERS</button>
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            {/* ── Persona card ──────────────────────────────────────────── */}
            <div className="bg-surface-low p-8 flex flex-col small:flex-row gap-8 items-start">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center flex-shrink-0">
                <span className="font-grotesk font-bold text-2xl text-primary">
                  {persona.charAt(0)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="eyebrow text-primary">YOUR PERSONA</span>
                <h2 className="font-grotesk font-bold text-2xl text-on-surface">{persona}</h2>
                <p className="font-inter text-sm text-on-surface-variant">{personaDesc}</p>
                <p className="font-inter text-xs text-on-surface-disabled mt-2">
                  Based on {total} fragrance{total !== 1 ? "s" : ""} across {orders.length} order{orders.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* ── Tier breakdown ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
              <h2 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface-variant">
                TIER BREAKDOWN
              </h2>
              <div className="flex flex-col gap-4">
                {(["crowd-pleasers", "intro-to-niche", "polarizing-art"] as const).map((tier) => {
                  const meta = TIER_META[tier]
                  const count = tierCounts[tier] ?? 0
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={tier} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-px" style={{ backgroundColor: meta.color, height: 2 }} />
                          <span className="font-grotesk text-[10px] tracking-[0.15em] text-on-surface">
                            {meta.label}
                          </span>
                        </div>
                        <span className="font-inter text-xs" style={{ color: meta.color }}>
                          {count} · {pct}%
                        </span>
                      </div>
                      <div className="h-px bg-surface-variant/30 relative">
                        <div
                          className="absolute left-0 top-0 h-px transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: meta.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Discovery timeline ──────────────────────────────────────── */}
            {timeline.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface-variant">
                  DISCOVERY TIMELINE
                </h2>
                <div className="relative flex flex-col gap-0">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-4 bottom-4 w-px bg-surface-variant/30" />
                  {timeline.map((entry, i) => {
                    const meta = TIER_META[entry.tier as keyof typeof TIER_META] ?? TIER_META.unknown
                    return (
                      <div key={i} className="flex gap-6 items-start py-4">
                        {/* Dot */}
                        <div
                          className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center"
                          style={{ position: "relative", zIndex: 1 }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                        </div>
                        {/* Content */}
                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                          <LocalizedClientLink href={`/products/${entry.handle}`}>
                            <span className="font-grotesk text-sm font-semibold text-on-surface hover:text-primary transition-colors">
                              {entry.productTitle}
                            </span>
                          </LocalizedClientLink>
                          <div className="flex gap-3 items-center">
                            <span className="font-grotesk text-[9px] tracking-[0.15em]" style={{ color: meta.color }}>
                              {meta.label}
                            </span>
                            <span className="font-inter text-[10px] text-on-surface-disabled">
                              {new Date(entry.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Next step CTA ───────────────────────────────────────────── */}
            {nextTier && (
              <div
                className="p-8 flex flex-col small:flex-row items-start small:items-center justify-between gap-6"
                style={{ borderLeft: `2px solid ${nextTier.color}` }}
              >
                <div className="flex flex-col gap-2">
                  <span className="font-grotesk text-[9px] tracking-[0.2em] text-on-surface-variant">
                    YOUR NEXT CHAPTER
                  </span>
                  <h3 className="font-grotesk font-bold text-xl text-on-surface">
                    Ready for {nextTier.label}?
                  </h3>
                  <p className="font-inter text-sm text-on-surface-variant">
                    You&apos;ve mastered the previous tier. Evolve to the next level of your journey.
                  </p>
                </div>
                <LocalizedClientLink href={nextTier.href}>
                  <button className="btn-primary flex-shrink-0">
                    EXPLORE {nextTier.label}
                  </button>
                </LocalizedClientLink>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
