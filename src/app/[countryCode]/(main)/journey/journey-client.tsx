"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import type { CSSProperties } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PerfumeDetails } from "../../../../types/perfume"
import type { ConstellationNode } from "./ConstellationMap"
import ScentRadar, { RadarScores } from "./ScentRadar"
import { generatePersonaQuote } from "./scent-quotes"

// Dynamic import with ssr:false eliminates all SSR/hydration float concerns
const ConstellationMap = dynamic(() => import("./ConstellationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="font-inter text-[9px] tracking-[0.25em] text-on-surface-disabled uppercase">
        mapping your constellation…
      </span>
    </div>
  ),
})

// ─── Constants ───────────────────────────────────────────────────────────────

const TIER_META: Record<string, { label: string; color: string }> = {
  "crowd-pleaser":  { label: "CROWD PLEASER",  color: "#4FDBCC" },
  "intro-to-niche": { label: "INTRO TO NICHE", color: "#D4AF37" },
  "polarizing-art": { label: "POLARIZING ART", color: "#FF6B6B" },
  unknown:          { label: "ARCHIVE",        color: "#7B7FA6" },
}

const LONGEVITY_LABELS: Record<string, string> = {
  low:    "A Few Hours",
  medium: "Half a Day",
  high:   "Dusk Till Dawn",
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = {
  customer: HttpTypes.StoreCustomer
  orders: HttpTypes.StoreOrder[]
  perfumeMap: Record<string, PerfumeDetails>
  productTierMap: Record<string, string>
  productTagsMap: Record<string, string[]>
}

type TimelineEntry = {
  date: string
  productTitle: string
  handle: string
  productId: string
  tier: string
  thumbnail: string | null
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function buildJourneyData(
  orders: HttpTypes.StoreOrder[],
  perfumeMap: Record<string, PerfumeDetails>,
  productTierMap: Record<string, string>
) {
  const tierCounts: Record<string, number> = {
    "crowd-pleaser": 0,
    "intro-to-niche": 0,
    "polarizing-art": 0,
    unknown: 0,
  }
  const timeline: Array<{
    date: string
    productTitle: string
    handle: string
    productId: string
    tier: string
    thumbnail: string | null
  }> = []
  const seen = new Set<string>()

  for (const order of orders) {
    for (const item of order.items ?? []) {
      const resolvedProductId = (item.product as any)?.id ?? item.product_id ?? null
      const pid = resolvedProductId ?? item.variant_id ?? item.id
      const tier = productTierMap[resolvedProductId ?? ""] ?? "unknown"
      tierCounts[tier] = (tierCounts[tier] ?? 0) + (item.quantity ?? 1)
      if (pid && !seen.has(pid)) {
        seen.add(pid)
        timeline.push({
          date: String(order.created_at),
          productTitle: item.product_title ?? item.title ?? "Unknown",
          handle: item.product_handle ?? "",
          productId: resolvedProductId ?? pid,
          tier,
          thumbnail: item.thumbnail ?? null,
        })
      }
    }
  }

  const total = Object.values(tierCounts).reduce((a, b) => a + b, 0)

  // Avg longevity
  const lvMap = { low: 1, medium: 2, high: 3 } as const
  const lvVals = timeline.map((e) => perfumeMap[e.productId]?.longevity).filter((v): v is string => !!v)
  const lvAvg =
    lvVals.length > 0
      ? lvVals.reduce((a, v) => a + (lvMap[v as keyof typeof lvMap] ?? 0), 0) / lvVals.length
      : 0
  const longevitySummary = lvAvg >= 2.5 ? "High" : lvAvg >= 1.5 ? "Medium" : lvAvg >= 0.5 ? "Low" : null

  // Persona
  let persona = "The Beginner"
  let personaDesc =
    "Your first steps into the world of niche fragrance. Every purchase is a new chapter waiting to be written."
  if (total === 0) {
    persona = "The Unscented"
    personaDesc = "Your journey hasn't begun yet."
  } else if (tierCounts["polarizing-art"] >= 2) {
    persona = "The Connoisseur"
    personaDesc =
      "You're drawn to the depth of the shadows — where music meets moonlight. Your selections reveal a preference for heavy base notes and enigmatic finishes that linger long after the sun sets."
  } else if (tierCounts["intro-to-niche"] >= 2) {
    persona = "The Explorer"
    personaDesc =
      "Curiosity is your compass. You seek out scents that tell a story — complex narratives crafted from rare ingredients and bold artistic vision."
  } else if (tierCounts["crowd-pleaser"] >= 2) {
    persona = "The Crowd Pleaser"
    personaDesc =
      "You wear what works — confidently. Your collection blends accessibility with elegance, making a statement without demanding a stage."
  } else if (total >= 1) {
    persona = "The Initiate"
    personaDesc = "A single signature scent in your arsenal. The collection begins here."
  }

  return { tierCounts, total, timeline, persona, personaDesc, longevitySummary }
}

function computeRadarScores(
  timeline: TimelineEntry[],
  perfumeMap: Record<string, PerfumeDetails>
): RadarScores {
  const items = timeline
    .map((e) => perfumeMap[e.productId])
    .filter((p): p is PerfumeDetails => !!p)

  if (items.length === 0) {
    return { projection: 0.35, longevity: 0.35, richness: 0.35, versatility: 0.25, depth: 0.35 }
  }

  const lv = { low: 0.3, medium: 0.65, high: 1.0 }
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)

  const deepSet = new Set(["evening", "winter", "date", "strong"])
  let deepCount = 0, totalOcc = 0
  items.forEach((p) => {
    if (p.occasions) {
      const occs = p.occasions.split(",").map((s) => s.trim()).filter(Boolean)
      totalOcc += occs.length
      deepCount += occs.filter((o) => deepSet.has(o)).length
    }
  })

  return {
    projection:  avg(items.map((p) => lv[p.sillage  as keyof typeof lv] ?? 0.3)),
    longevity:   avg(items.map((p) => lv[p.longevity as keyof typeof lv] ?? 0.3)),
    richness:    avg(items.map((p) =>
      [p.top_notes, p.middle_notes, p.base_notes].filter(Boolean).length / 3
    )),
    versatility: Math.min(totalOcc / Math.max(items.length * 4, 1), 1),
    depth:       totalOcc > 0 ? deepCount / totalOcc : 0.38,
  }
}

function buildTagCounts(
  timeline: TimelineEntry[],
  productTagsMap: Record<string, string[]>
): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const e of timeline) {
    for (const tag of productTagsMap[e.productId] ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

function TagProfileChart({ tagCounts }: { tagCounts: { tag: string; count: number }[] }) {
  if (tagCounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 px-4 text-center h-full">
        <h3 className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.04em]">
          Scent Character
        </h3>
        <p className="font-inter text-[9px] text-on-surface-disabled leading-relaxed">
          Tag your products in the admin to reveal your scent character profile.
        </p>
      </div>
    )
  }
  const max = tagCounts[0].count
  const top = tagCounts.slice(0, 7)
  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.04em]">
          Scent Character
        </h3>
        <p className="font-inter text-[8px] tracking-[0.15em] uppercase text-on-surface-disabled">
          YOUR TAG SIGNATURE
        </p>
      </div>
      <div className="flex flex-col gap-3.5 w-full max-w-[260px]">
        {top.map(({ tag, count }) => (
          <div key={tag} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-variant truncate">
                {tag}
              </span>
              <span className="font-grotesk text-[10px] text-on-surface-disabled flex-shrink-0">
                {count}
              </span>
            </div>
            <div className="relative h-[2px] w-full bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${(count / max) * 100}%`,
                  background: "linear-gradient(90deg, rgba(79,219,204,0.4), #4FDBCC)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Radar summary ────────────────────────────────────────────────────────────

function radarSummary(scores: RadarScores): string {
  const lv = scores.longevity  >= 0.7 ? "High"     : scores.longevity  >= 0.45 ? "Moderate" : "Light"
  const pr = scores.projection >= 0.7 ? "strong"   : scores.projection >= 0.45 ? "moderate" : "light"
  return `${lv} longevity and ${pr} projection`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JourneyClient({ customer, orders, perfumeMap, productTierMap, productTagsMap }: Props) {
  const { tierCounts, total, timeline, persona, personaDesc, longevitySummary } =
    buildJourneyData(orders, perfumeMap, productTierMap)

  const personaQuote = total > 0
    ? generatePersonaQuote({ timeline, perfumeMap, tierCounts, productTagsMap })
    : ""

  const featuredId = timeline[0]?.productId ?? null
  const [selectedId, setSelectedId] = useState<string>(featuredId ?? "")

  const selectedEntry = timeline.find((e) => e.productId === selectedId) ?? timeline[0]
  const selectedPerfume = selectedEntry ? perfumeMap[selectedEntry.productId] : null
  const selectedTierMeta = TIER_META[selectedEntry?.tier ?? "unknown"] ?? TIER_META.unknown

  const radarScores = computeRadarScores(timeline, perfumeMap)
  const tagCounts = buildTagCounts(timeline, productTagsMap)

  const nodes: ConstellationNode[] = timeline.map((e) => {
    const p = perfumeMap[e.productId]
    return {
      productId: e.productId,
      title: e.productTitle,
      tier: e.tier,
      handle: e.handle,
      scentWeight: p?.scent_weight ?? null,
      sillage: p?.sillage ?? null,
      longevity: p?.longevity ?? null,
    }
  })

  const nextTier =
    tierCounts["crowd-pleaser"] > 0 && tierCounts["intro-to-niche"] === 0
      ? { label: "INTRO TO NICHE", href: "/categories/intro-to-niche" }
      : tierCounts["intro-to-niche"] > 0 && tierCounts["polarizing-art"] === 0
      ? { label: "POLARIZING ART", href: "/categories/polarizing-art" }
      : null

  // ── Empty state ─────────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(20,30,38,1) 0%, rgba(7,9,13,1) 100%)",
        }}
      >
        <div className="flex flex-col gap-8 max-w-[480px] px-8">
          <span className="font-inter text-[9px] tracking-[0.25em] text-primary uppercase">
            SCENT PERSONALITY
          </span>
          <h1 className="font-grotesk font-bold text-6xl text-on-surface tracking-[-0.03em] leading-[0.9]">
            Your Scent Personality,
            <br />
            <em style={{ color: "#4FDBCC", fontStyle: "italic" }}>{customer.first_name}</em>
          </h1>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
            Your constellation is empty. Every fragrance you purchase places a new star in your map.
          </p>
          <LocalizedClientLink href="/categories/crowd-pleaser">
            <button className="btn-primary">BEGIN YOUR JOURNEY →</button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  const dominantNotes =
    selectedPerfume?.base_notes ??
    selectedPerfume?.middle_notes ??
    selectedPerfume?.top_notes ??
    "—"

  // ── Main layout ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/constilation.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "rgba(7,9,13,1)",
      }}
    >
      {/* Dark overlay so text and UI stay readable over the photo */}
      <div className="min-h-screen" style={{ background: "rgba(7,9,13,0.68)" }}>
      <div className="content-container pt-10 pb-16 flex flex-col gap-0">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-8 pb-2">
          <div className="flex flex-col gap-2">
            <span className="font-inter text-[9px] tracking-[0.28em] text-primary uppercase">
              SCENT PERSONALITY
            </span>
            <h1 className="font-grotesk font-bold text-5xl small:text-[3.75rem] text-on-surface tracking-[-0.03em] leading-[0.88]">
              Your Scent Personality,
              <br />
              <em style={{ color: "#4FDBCC", fontStyle: "italic" }}>{customer.first_name}</em>
            </h1>
          </div>

          {/* Floating stat card */}
          <div
            className="hidden small:flex flex-col gap-2 p-5 min-w-[210px] max-w-[270px] flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled">
              {timeline.length} scent{timeline.length !== 1 ? "s" : ""} discovered
              {" · "}
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </p>
            <p className="font-inter text-xs text-on-surface-variant leading-relaxed">
              Your evolving persona:{" "}
              <span className="text-primary font-medium">{persona}</span>
              {longevitySummary && (
                <>
                  {" "}with{" "}
                  <span className="text-on-surface">{longevitySummary}</span>
                  {" "}avg longevity
                </>
              )}.
            </p>
            {selectedEntry && (
              <p className="font-inter text-[9px] text-on-surface-disabled">
                Viewing:{" "}
                <span className="font-medium" style={{ color: selectedTierMeta.color }}>
                  {selectedEntry.productTitle}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* ── Persona quote ────────────────────────────────────────────────── */}
        {personaQuote && (
          <div className="py-3 border-t border-surface-variant/10 mt-1">
            <p
              className="font-grotesk italic text-sm text-on-surface-variant leading-relaxed max-w-[680px] opacity-70"
              style={{ fontStyle: "italic" }}
            >
              &ldquo;{personaQuote}&rdquo;
            </p>
          </div>
        )}

        {/* ── Constellation ────────────────────────────────────────────────── */}
        <div className="w-full" style={{ height: "clamp(300px, 52vh, 520px)" }}>
          <ConstellationMap
            nodes={nodes}
            featuredId={featuredId}
            selectedId={selectedId}
            onSelect={(n) => setSelectedId(n.productId)}
          />
        </div>

        {/* ── Constellation legend + interpretation ───────────────────────── */}
        <div className="flex flex-col gap-1.5 pt-1 pb-1">
          <p className="font-inter text-[8px] tracking-[0.1em] text-on-surface-disabled italic">
            Stars map your collection by tier — tap to explore.
          </p>
          <div className="flex gap-5 flex-wrap">
            {(
              [
                { label: "Size",       value: "depth"      },
                { label: "Brightness", value: "projection" },
                { label: "Tail",       value: "longevity"  },
              ] as const
            ).map(({ label, value }) => (
              <span key={label} className="font-inter text-[8.5px] tracking-[0.12em] text-on-surface">
                <span className="font-semibold uppercase">{label}</span>
                <span className="font-normal" style={{ color: "rgba(255,255,255,0.5)" }}> · {value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom section ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 small:grid-cols-3 gap-5 pt-2">

          {/* Featured scent card */}
          <div
            className="flex flex-col gap-5 p-8"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="font-inter text-[8px] tracking-[0.22em] uppercase"
              style={{ color: selectedTierMeta.color }}
            >
              {selectedTierMeta.label}
            </span>

            <h2 className="font-grotesk font-bold text-3xl text-on-surface tracking-[-0.02em] leading-[1.05]">
              {selectedEntry?.productTitle ?? persona}
            </h2>

            <p
              className="font-inter text-sm italic text-on-surface-disabled leading-relaxed"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              } as CSSProperties}
            >
              &ldquo;{selectedPerfume?.scent_story ?? personaDesc}&rdquo;
            </p>

            <div
              className="flex gap-8 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex flex-col gap-1">
                <span className="font-inter text-[8px] tracking-[0.2em] uppercase text-on-surface-disabled">
                  DOMINANT NOTES
                </span>
                <span className="font-grotesk text-sm text-on-surface-variant">
                  {dominantNotes}
                </span>
              </div>
              {selectedPerfume?.longevity && (
                <div className="flex flex-col gap-1">
                  <span className="font-inter text-[8px] tracking-[0.2em] uppercase text-on-surface-disabled">
                    LONGEVITY
                  </span>
                  <span className="font-grotesk text-sm text-on-surface-variant">
                    {LONGEVITY_LABELS[selectedPerfume.longevity] ?? selectedPerfume.longevity}
                  </span>
                </div>
              )}
            </div>

            {selectedEntry && (
              <LocalizedClientLink href={`/products/${selectedEntry.handle}`}>
                <button
                  className="font-inter text-[9px] tracking-[0.2em] uppercase px-6 py-3 transition-opacity hover:opacity-80"
                  style={{
                    background: "rgba(79,219,204,0.1)",
                    border: "1px solid rgba(79,219,204,0.38)",
                    color: "#4FDBCC",
                  }}
                >
                  EXPLORE {selectedEntry.productTitle.toUpperCase()} →
                </button>
              </LocalizedClientLink>
            )}
          </div>

          {/* Scent DNA radar */}
          <div className="flex flex-col items-center justify-center gap-5 py-6 px-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.04em]">
                Scent DNA Breakdown
              </h3>
              <p className="font-inter text-[8px] tracking-[0.15em] uppercase text-on-surface-disabled">
                BUILT ON YOUR {timeline.length}-SCENT MAPPING
              </p>
            </div>
            <ScentRadar scores={radarScores} />
            <p className="font-inter text-[8px] tracking-[0.12em] text-on-surface-disabled text-center">
              {radarSummary(radarScores)}
            </p>
          </div>

          {/* Tag signature */}
          <div className="flex flex-col items-center justify-center">
            <TagProfileChart tagCounts={tagCounts} />
          </div>
        </div>

        {/* ── Next tier CTA ────────────────────────────────────────────────── */}
        {nextTier && (
          <div
            className="mt-5 px-6 py-5 flex items-center justify-between gap-6"
            style={{ borderLeft: "2px solid rgba(79,219,204,0.35)" }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-inter text-[8px] tracking-[0.2em] text-on-surface-disabled uppercase">
                YOUR NEXT CHAPTER
              </span>
              <span className="font-grotesk text-base text-on-surface">
                Ready for <strong>{nextTier.label}</strong>?
              </span>
            </div>
            <LocalizedClientLink href={nextTier.href}>
              <button className="btn-ghost text-xs flex-shrink-0">
                EXPLORE {nextTier.label} →
              </button>
            </LocalizedClientLink>
          </div>
        )}

      </div>
      </div>
    </div>
  )
}
