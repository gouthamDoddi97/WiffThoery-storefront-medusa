"use client"

// ─────────────────────────────────────────────────────────────────────────────
// ConstellationMap — zone-based layout with live animated stars
//
// Star visual properties derived from perfume data:
//   size       ← scent_weight (1–10)  heavy = big, light = small
//   brightness ← sillage              high projection = brighter
//   trail      ← longevity            longer lasting = longer comet tail
//
// Each star drifts on a small deterministic tilted ellipse orbit around
// its zone base position. The trail is rendered as a gradient line pointing
// backward along the instantaneous velocity vector.
//
// Zones:
//   CROWD PLEASERS  — top-left   (cx 182, cy 155)
//   INTRO TO NICHE  — centre     (cx 415, cy 265)
//   POLARIZING ART  — btm-right  (cx 648, cy 375)
//   ARCHIVE/UNKNOWN — btm-left   (cx 168, cy 400)
//
// Imported via next/dynamic ssr:false — no hydration concerns.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"

export type ConstellationNode = {
  productId: string
  title: string
  tier: string
  handle: string
  scentWeight?: number | null  // 1–10, null defaults to 5
  sillage?: string | null      // "low" | "medium" | "high"
  longevity?: string | null    // "low" | "medium" | "high"
}

type Props = {
  nodes: ConstellationNode[]
  featuredId?: string | null
  selectedId?: string | null
  onSelect: (node: ConstellationNode) => void
}

// ── Zone definitions ──────────────────────────────────────────────────────────

const ZONES: Record<string, {
  cx: number; cy: number; r: number
  color: string; label: string
  lx: number; ly: number
}> = {
  "crowd-pleaser": {
    cx: 182, cy: 155, r: 90,
    color: "#4FDBCC", label: "CROWD PLEASERS",
    lx: 182, ly: 263,
  },
  "intro-to-niche": {
    cx: 415, cy: 265, r: 88,
    color: "#D4AF37", label: "INTRO TO NICHE",
    lx: 415, ly: 369,
  },
  "polarizing-art": {
    cx: 648, cy: 375, r: 90,
    color: "#FF6B6B", label: "POLARIZING ART",
    lx: 648, ly: 480,
  },
  unknown: {
    cx: 168, cy: 400, r: 66,
    color: "#7B7FA6", label: "ARCHIVE",
    lx: 168, ly: 480,
  },
}

const TIER_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ZONES).map(([k, v]) => [k, v.color])
)

// ── Hash util ─────────────────────────────────────────────────────────────────

function h32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}
function hf(s: string, salt: number): number {
  return (h32(s + String(salt)) % 100000) / 100000
}
function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "")
}

// ── Zone placement (base positions) ──────────────────────────────────────────

const GOLDEN_ANGLE = 2.39996323

type PlacedNode = ConstellationNode & {
  bx: number; by: number   // base position (zone centre + spread)
  color: string; tierKey: string
}

function computePlaced(nodes: ConstellationNode[]): PlacedNode[] {
  const groups: Record<string, ConstellationNode[]> = {}
  for (const n of nodes) {
    const t = n.tier in ZONES ? n.tier : "unknown"
    ;(groups[t] ??= []).push(n)
  }

  return nodes.map((n) => {
    const tierKey = n.tier in ZONES ? n.tier : "unknown"
    const zone = ZONES[tierKey]
    const grp = groups[tierKey]
    const i = grp.findIndex((g) => g.productId === n.productId)
    const count = grp.length

    let bx: number, by: number
    if (count === 1) {
      const angle = hf(n.productId, 1) * 2 * Math.PI
      const rad = 12 + Math.floor(hf(n.productId, 2) * 26)
      bx = zone.cx + Math.cos(angle) * rad
      by = zone.cy + Math.sin(angle) * rad
    } else {
      const angle = i * GOLDEN_ANGLE + hf(n.productId, 3) * 0.4
      const rad = zone.r * 0.76 * Math.sqrt((i + 1) / count)
      bx = zone.cx + Math.cos(angle) * rad
      by = zone.cy + Math.sin(angle) * rad
    }

    return {
      ...n,
      bx: Math.round(bx * 10) / 10,
      by: Math.round(by * 10) / 10,
      color: TIER_COLORS[tierKey] ?? "#7B7FA6",
      tierKey,
    }
  })
}

// ── Star visual properties ────────────────────────────────────────────────────

function starVisual(node: ConstellationNode, scale = 1) {
  const weight = Math.max(1, Math.min(10, node.scentWeight ?? 5))
  // weight 1 → r=3.5   weight 10 → r=13
  const baseR = (3.5 + ((weight - 1) / 9) * 9.5) * scale

  const siMap: Record<string, number> = { low: 0.42, medium: 0.70, high: 1.0 }
  const brightness = siMap[node.sillage ?? ""] ?? 0.62

  const trailMap: Record<string, number> = { low: 0, medium: 38, high: 78 }
  const trailLen = trailMap[node.longevity ?? ""] ?? 0

  return { baseR, brightness, trailLen }
}

// ── Orbit params (deterministic, never change per node) ───────────────────────

function orbitParams(id: string) {
  return {
    rx:    8 + hf(id, 10) * 18,           // 8–26 px
    ry:    5 + hf(id, 11) * 11,           // 5–16 px
    speed: 0.055 + hf(id, 12) * 0.20,    // 0.055–0.255 rad/s (slow drift)
    phase: hf(id, 13) * 2 * Math.PI,
    tilt:  hf(id, 14) * Math.PI,          // orbit rotation
  }
}

// Given orbit params + time, return current offset from base + velocity dir
function orbitState(o: ReturnType<typeof orbitParams>, t: number) {
  const a = o.speed * t + o.phase
  const cosT = Math.cos(o.tilt), sinT = Math.sin(o.tilt)
  // ellipse point
  const ex = o.rx * Math.cos(a)
  const ey = o.ry * Math.sin(a)
  // derivative
  const dvx = -o.rx * o.speed * Math.sin(a)
  const dvy =  o.ry * o.speed * Math.cos(a)
  return {
    ox:  cosT * ex  - sinT * ey,
    oy:  sinT * ex  + cosT * ey,
    vx:  cosT * dvx - sinT * dvy,
    vy:  sinT * dvx + cosT * dvy,
  }
}

// ── SVG glyph path centred on (0, 0) ─────────────────────────────────────────

function buildGlyphD(tier: string, r: number): string | null {
  switch (tier) {
    case "crowd-pleaser":
      return null // <circle>
    case "intro-to-niche":
      return `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`
    case "polarizing-art": {
      const pts: string[] = []
      for (let k = 0; k < 6; k++) {
        const ao = (k * Math.PI) / 3 - Math.PI / 2
        const ai = ((k + 0.5) * Math.PI) / 3 - Math.PI / 2
        const ox = Math.round(r * Math.cos(ao) * 100) / 100
        const oy = Math.round(r * Math.sin(ao) * 100) / 100
        const ix = Math.round(r * 0.46 * Math.cos(ai) * 100) / 100
        const iy = Math.round(r * 0.46 * Math.sin(ai) * 100) / 100
        pts.push(`${k === 0 ? "M" : "L"} ${ox} ${oy}`, `L ${ix} ${iy}`)
      }
      return pts.join(" ") + " Z"
    }
    default: {
      const hh = Math.round(r * 0.866 * 100) / 100
      const hf2 = Math.round(r * 0.5 * 100) / 100
      return `M 0 ${-r} L ${hh} ${hf2} L ${-hh} ${hf2} Z`
    }
  }
}

// Background image replaces programmatic star field — see /public/constilation.webp

// ── Ghost stars — vacant positions ──────────────────────────────────────────

const GHOST_STARS: { x: number; y: number; r: number; op: number; blur?: boolean }[] = [
  // Outer field — original
  { x: 105, y:  75, r: 2.2, op: 0.45 },
  { x: 248, y:  90, r: 2.8, op: 0.40 },
  { x:  68, y: 185, r: 2.0, op: 0.42 },
  { x: 295, y: 155, r: 2.5, op: 0.48 },
  { x: 330, y: 200, r: 2.2, op: 0.38 },
  { x: 490, y: 155, r: 3.0, op: 0.44 },
  { x: 545, y: 205, r: 2.3, op: 0.40 },
  { x: 590, y: 150, r: 2.7, op: 0.46 },
  { x: 682, y: 198, r: 2.1, op: 0.38 },
  { x: 730, y: 258, r: 2.5, op: 0.42 },
  { x: 748, y: 362, r: 2.3, op: 0.39 },
  { x: 733, y: 455, r: 2.6, op: 0.40 },
  { x: 350, y: 418, r: 2.9, op: 0.44 },
  { x: 270, y: 462, r: 2.2, op: 0.38 },
  { x:  80, y: 456, r: 2.5, op: 0.41 },
  { x: 432, y: 488, r: 2.1, op: 0.36 },
  { x: 558, y: 472, r: 2.7, op: 0.41 },
  { x: 620, y: 490, r: 2.0, op: 0.37 },
  { x: 312, y: 312, r: 2.4, op: 0.40 },
  { x: 480, y: 412, r: 2.3, op: 0.39 },
  { x: 598, y: 314, r: 2.8, op: 0.46 },
  { x: 148, y: 312, r: 2.3, op: 0.40 },
  // Slightly larger — "almost occupied"
  { x: 192, y: 242, r: 3.4, op: 0.52 },
  { x: 512, y: 342, r: 3.5, op: 0.50 },
  { x: 388, y:  98, r: 3.2, op: 0.48 },
  // Upper-right void
  { x: 650, y:  44, r: 2.0, op: 0.34, blur: true },
  { x: 695, y:  82, r: 2.5, op: 0.42 },
  { x: 740, y:  52, r: 1.8, op: 0.30, blur: true },
  { x: 775, y: 118, r: 2.3, op: 0.40 },
  { x: 718, y: 155, r: 2.7, op: 0.44 },
  { x: 785, y: 195, r: 2.0, op: 0.33, blur: true },
  { x: 630, y: 112, r: 2.4, op: 0.43 },
  { x: 758, y:  78, r: 1.9, op: 0.32, blur: true },
  // Mid-right fill
  { x: 700, y: 300, r: 2.0, op: 0.33, blur: true },
  { x: 775, y: 328, r: 2.7, op: 0.43 },
  { x: 760, y: 440, r: 2.1, op: 0.36, blur: true },
  // Upper-centre bridge
  { x: 355, y:  40, r: 2.2, op: 0.38 },
  { x: 450, y:  55, r: 2.5, op: 0.41 },
  { x: 522, y:  38, r: 1.9, op: 0.31, blur: true },
  { x: 578, y:  78, r: 2.4, op: 0.41 },
  // Centre field between zones
  { x: 302, y: 220, r: 2.2, op: 0.35, blur: true },
  { x: 365, y: 292, r: 2.6, op: 0.43 },
  { x: 508, y: 222, r: 2.0, op: 0.33, blur: true },
  { x: 452, y: 318, r: 2.7, op: 0.43 },
  { x: 555, y: 288, r: 2.3, op: 0.37, blur: true },
  // Lower area between archive and polarizing
  { x: 405, y: 448, r: 2.2, op: 0.36, blur: true },
  { x: 472, y: 506, r: 1.9, op: 0.33 },
  { x: 535, y: 512, r: 2.3, op: 0.36, blur: true },
  { x: 245, y: 510, r: 2.0, op: 0.34 },
  { x: 142, y: 514, r: 1.9, op: 0.30, blur: true },
  { x:  88, y: 502, r: 1.8, op: 0.31 },
  // Left edge
  { x:  38, y: 102, r: 2.1, op: 0.34, blur: true },
  { x:  44, y: 228, r: 2.4, op: 0.40 },
  { x:  28, y: 342, r: 2.0, op: 0.32, blur: true },
  { x:  52, y: 448, r: 2.2, op: 0.38 },
  // Larger blurred — future zones hinted
  { x: 535, y: 178, r: 3.4, op: 0.44, blur: true },
  { x: 278, y: 375, r: 3.6, op: 0.46, blur: true },
  { x: 692, y: 468, r: 3.3, op: 0.43, blur: true },
  { x: 132, y:  58, r: 3.1, op: 0.42, blur: true },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ConstellationMap({ nodes, featuredId, selectedId, onSelect }: Props) {
  // Animation time in seconds
  const [time, setTime] = useState(0)
  useEffect(() => {
    let rafId: number
    let start: number | null = null
    const loop = (ts: number) => {
      if (start === null) start = ts
      setTime((ts - start) / 1000)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Larger stars on mobile (SVG viewBox 800×520 shrinks hard on narrow screens)
  const [starBoost, setStarBoost] = useState(1)
  useEffect(() => {
    const update = () => setStarBoost(window.innerWidth < 640 ? 1.7 : 1)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const placed = computePlaced(nodes)

  const zoneGroups: Record<string, PlacedNode[]> = {}
  for (const p of placed) {
    ;(zoneGroups[p.tierKey] ??= []).push(p)
  }
  const activeZones = new Set(placed.map((p) => p.tierKey))

  // For each placed node, compute animated position
  const animated = placed.map((n) => {
    const orbit = orbitParams(n.productId)
    const { ox, oy, vx, vy } = orbitState(orbit, time)
    return { ...n, x: n.bx + ox, y: n.by + oy, vx, vy }
  })

  // Journey arc through occupied main tier zone centres
  const arcTiers = (["crowd-pleaser", "intro-to-niche", "polarizing-art"] as const).filter(
    (t) => activeZones.has(t)
  )
  let journeyPath = ""
  if (arcTiers.length === 3) {
    const [a, b, c] = arcTiers.map((t) => ZONES[t])
    journeyPath = `M ${a.cx} ${a.cy} C ${(a.cx + b.cx) / 2 + 18} ${a.cy - 28}, ${(b.cx + c.cx) / 2 - 18} ${c.cy + 28}, ${c.cx} ${c.cy}`
  } else if (arcTiers.length === 2) {
    const [a, b] = arcTiers.map((t) => ZONES[t])
    journeyPath = `M ${a.cx} ${a.cy} Q ${(a.cx + b.cx) / 2} ${(a.cy + b.cy) / 2 - 42} ${b.cx} ${b.cy}`
  }

  // Constellation web: nearest-neighbour graph — max 2 edges per star, sorted by distance.
  // This creates isolated chain/cluster groups instead of one crowded mesh.
  const CONNECT_DIST = 95   // max distance to even consider connecting
  const MAX_DEGREE   = 2    // max edges per star (keeps constellations sparse)
  type StarPt = { x: number; y: number; key: string }
  const allStarPts: StarPt[] = [
    ...GHOST_STARS.map((gs, i) => ({ x: gs.x, y: gs.y, key: `g${i}` })),
    ...placed.map((n) => ({ x: n.bx, y: n.by, key: `p${n.productId}` })),
  ]
  // collect all candidate pairs within distance, then sort nearest-first
  const candidates: { i: number; j: number; d2: number }[] = []
  for (let i = 0; i < allStarPts.length; i++) {
    for (let j = i + 1; j < allStarPts.length; j++) {
      const dx = allStarPts[i].x - allStarPts[j].x
      const dy = allStarPts[i].y - allStarPts[j].y
      const d2 = dx * dx + dy * dy
      if (d2 <= CONNECT_DIST * CONNECT_DIST) candidates.push({ i, j, d2 })
    }
  }
  candidates.sort((a, b) => a.d2 - b.d2)
  // greedy: add edge only if both endpoints have degree < MAX_DEGREE
  const degrees = new Map<string, number>()
  const webLines: { x1: number; y1: number; x2: number; y2: number; k: string }[] = []
  for (const { i, j } of candidates) {
    const ki = allStarPts[i].key, kj = allStarPts[j].key
    if ((degrees.get(ki) ?? 0) >= MAX_DEGREE) continue
    if ((degrees.get(kj) ?? 0) >= MAX_DEGREE) continue
    degrees.set(ki, (degrees.get(ki) ?? 0) + 1)
    degrees.set(kj, (degrees.get(kj) ?? 0) + 1)
    const a = allStarPts[i], b = allStarPts[j]
    webLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, k: `${ki}-${kj}` })
  }

  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full h-full"
      style={{ overflow: "visible" }}
      aria-label="Scent constellation map"
    >
      <defs>
        {/* Zone glow gradients */}
        {Object.entries(ZONES).map(([tier, z]) => (
          <radialGradient key={tier} id={`zg-${tier.replace(/-/g, "")}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={z.color} stopOpacity={0.17} />
            <stop offset="65%"  stopColor={z.color} stopOpacity={0.05} />
            <stop offset="100%" stopColor={z.color} stopOpacity={0}    />
          </radialGradient>
        ))}
        {/* Node glow filter */}
        <filter id="ng" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Ghost-star blur filter */}
        <filter id="ghost-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        {/* Per-node trail gradients (positions update each frame) */}
        {animated.map((node) => {
          const { trailLen, brightness } = starVisual(node, starBoost)
          if (trailLen === 0) return null
          const vmag = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
          if (vmag < 0.001) return null
          const tx = node.x - (node.vx / vmag) * trailLen
          const ty = node.y - (node.vy / vmag) * trailLen
          return (
            <linearGradient
              key={`tg-${node.productId}`}
              id={`tg-${safeId(node.productId)}`}
              x1={node.x} y1={node.y}
              x2={tx} y2={ty}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%"   stopColor={node.color} stopOpacity={brightness * 0.85} />
              <stop offset="100%" stopColor={node.color} stopOpacity={0} />
            </linearGradient>
          )
        })}
      </defs>

      {/* Zone nebula glows */}
      {Object.entries(ZONES).map(([tier, z]) =>
        activeZones.has(tier) ? (
          <ellipse key={`nb-${tier}`} cx={z.cx} cy={z.cy} rx={z.r * 1.9} ry={z.r * 1.7}
            fill={`url(#zg-${tier.replace(/-/g, "")})`} />
        ) : null
      )}

      {/* Journey progression arc */}
      {journeyPath && (
        <path d={journeyPath} fill="none" stroke="rgba(255,255,255,0.07)"
          strokeWidth={1} strokeDasharray="3 12" />
      )}

      {/* Zone boundary rings */}
      {Object.entries(ZONES).map(([tier, z]) =>
        activeZones.has(tier) ? (
          <circle key={`br-${tier}`} cx={z.cx} cy={z.cy} r={z.r}
            fill="none" stroke={z.color} strokeWidth={0.5} strokeDasharray="2 9" opacity={0.22} />
        ) : null
      )}

      {/* Intra-zone constellation lines (connect base positions — stable) */}
      {Object.entries(zoneGroups).flatMap(([tier, grp]) => {
        if (grp.length < 2) return []
        const color = TIER_COLORS[tier] ?? "#7B7FA6"
        return grp.flatMap((a, i) =>
          grp.slice(i + 1).map((b, j) => (
            <line key={`il-${tier}-${i}-${j}`}
              x1={a.bx} y1={a.by} x2={b.bx} y2={b.by}
              stroke={color} strokeWidth={0.6} opacity={0.15} />
          ))
        )
      })}

      {/* Cross-zone filaments (base positions — stable) */}
      {placed.flatMap((a, i) =>
        placed.slice(i + 1)
          .filter((b) => b.tierKey !== a.tierKey)
          .map((b, j) => (
            <line key={`cl-${i}-${j}`}
              x1={a.bx} y1={a.by} x2={b.bx} y2={b.by}
              stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
          ))
      )}

      {/* Constellation web — dotted lines connecting all stars (ghost + product) */}
      {webLines.map((l) => (
        <line key={`sw-${l.k}`}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="white"
          strokeWidth={0.7}
          strokeDasharray="2 5"
          opacity={0.30}
        />
      ))}

      {/* Zone labels */}
      {Object.entries(ZONES).map(([tier, z]) =>
        activeZones.has(tier) ? (
          <text key={`lbl-${tier}`} x={z.lx} y={z.ly} fill={z.color}
            fontSize={5.5} fontFamily="ui-monospace, monospace" letterSpacing={2}
            textAnchor="middle" opacity={0.28}>
            {z.label}
          </text>
        ) : null
      )}

      {/* Ghost stars — vacant, unoccupied positions */}
      {GHOST_STARS.map((gs, i) => (
        <g key={`ghost-${i}`} filter={gs.blur ? "url(#ghost-blur)" : undefined}>
          {/* outer glow ring */}
          <circle cx={gs.x} cy={gs.y} r={gs.r * 3.2}
            fill="white" opacity={gs.op * 0.12} />
          {/* halo ring */}
          <circle cx={gs.x} cy={gs.y} r={gs.r * 2.0}
            fill="none" stroke="white" strokeWidth={0.8} opacity={gs.op * 0.70} />
          {/* core */}
          <circle cx={gs.x} cy={gs.y} r={gs.r}
            fill="white" opacity={gs.op} />
        </g>
      ))}

      {/* ── Animated nodes ─────────────────────────────────────────────────── */}
      {animated.map((node) => {
        const isFeatured = node.productId === featuredId
        const isSelected = node.productId === selectedId
        const isActive = isFeatured || isSelected
        const { baseR, brightness, trailLen } = starVisual(node, starBoost)
        const { color, tierKey, x, y, vx, vy } = node

        const vmag = Math.sqrt(vx * vx + vy * vy)
        const hasTrail = trailLen > 0 && vmag > 0.001

        const tx = hasTrail ? x - (vx / vmag) * trailLen : 0
        const ty = hasTrail ? y - (vy / vmag) * trailLen : 0

        const glyphD = buildGlyphD(tierKey, baseR)
        const label = node.title.length > 15 ? node.title.slice(0, 14) + "…" : node.title

        // Trail stroke width tapers with star size
        const trailW = baseR * 0.45

        return (
          <g key={node.productId} onClick={() => onSelect(node)} style={{ cursor: "pointer" }}
            filter={isActive ? "url(#ng)" : undefined}>

            {/* Comet trail */}
            {hasTrail && (
              <line
                x1={x} y1={y} x2={tx} y2={ty}
                stroke={`url(#tg-${safeId(node.productId)})`}
                strokeWidth={trailW}
                strokeLinecap="round"
                opacity={brightness}
              />
            )}

            {/* Halo */}
            <circle cx={x} cy={y} r={baseR + 14} fill={color} opacity={isActive ? 0.1 : 0.045} />

            {/* Featured rings */}
            {isFeatured && (
              <>
                <circle cx={x} cy={y} r={baseR + 22} fill="none" stroke={color} strokeWidth={0.4} opacity={0.15} />
                <circle cx={x} cy={y} r={baseR + 13} fill="none" stroke={color} strokeWidth={0.7} opacity={0.35} />
              </>
            )}

            {/* Selected ring */}
            {isSelected && !isFeatured && (
              <circle cx={x} cy={y} r={baseR + 9} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />
            )}

            {/* Glyph */}
            {glyphD === null ? (
              <circle cx={x} cy={y} r={baseR} fill={color} opacity={brightness * (isActive ? 1 : 0.9)} />
            ) : (
              <g transform={`translate(${x},${y})`}>
                <path d={glyphD} fill={color} opacity={brightness * (isActive ? 1 : 0.9)} />
              </g>
            )}

            {/* Inner gleam */}
            <circle cx={x - baseR * 0.2} cy={y - baseR * 0.25} r={baseR * 0.28}
              fill="white" opacity={0.18 + brightness * 0.10} />

            {/* Name label */}
            <text x={x} y={y + baseR + 14} fill="white"
              fontSize={isActive ? 7.5 : 6.5}
              fontFamily="ui-sans-serif, sans-serif"
              letterSpacing={0.5}
              textAnchor="middle"
              opacity={isActive ? 0.9 : 0.45}>
              {label.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}


