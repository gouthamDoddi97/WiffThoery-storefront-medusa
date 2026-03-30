"use client"

export type ConstellationNode = {
  productId: string
  title: string
  tier: string
  handle: string
}

type Props = {
  nodes: ConstellationNode[]
  featuredId?: string | null
  selectedId?: string | null
  onSelect: (node: ConstellationNode) => void
}

const TIER_COLORS: Record<string, string> = {
  "crowd-pleaser":  "#4FDBCC",
  "intro-to-niche": "#D4AF37",
  "polarizing-art": "#FF6B6B",
  unknown:          "#7B7FA6",
}

const TIER_RADII: Record<string, number> = {
  "crowd-pleaser":  88,
  "intro-to-niche": 162,
  "polarizing-art": 240,
  unknown:          305,
}

const ZONE_LABELS: Record<string, string> = {
  "crowd-pleaser":  "CROWD PLEASER",
  "intro-to-niche": "INTRO TO NICHE",
  "polarizing-art": "POLARIZING ART",
}

function deterministicAngle(id: string, index: number, total: number) {
  const spread = total > 1 ? (2 * Math.PI) / total : 0
  const base = -Math.PI / 2 + index * spread
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0
  }
  const jitter = ((Math.abs(h) % 1000) / 1000 - 0.5) * 0.28
  return base + jitter
}

// Stable background star field — values pre-rounded to avoid SSR/client float mismatch
const r4 = (n: number) => Math.round(n * 10000) / 10000
const STARS: { x: number; y: number; r: number; o: number }[] = Array.from(
  { length: 55 },
  (_, i) => {
    const ang = i * 137.508 * (Math.PI / 180)
    const rad = 18 + (i % 7) * 52
    return {
      x: r4(400 + Math.cos(ang) * rad),
      y: r4(260 + Math.sin(ang) * rad),
      r: r4(0.5 + (i % 4) * 0.35),
      o: r4(0.04 + (i % 6) * 0.018),
    }
  }
)

export default function ConstellationMap({ nodes, featuredId, selectedId, onSelect }: Props) {
  const cx = 400, cy = 260

  // Group nodes per tier for even angular spread
  const tierGroups: Record<string, ConstellationNode[]> = {}
  for (const n of nodes) {
    const t = n.tier in TIER_RADII ? n.tier : "unknown"
    ;(tierGroups[t] ??= []).push(n)
  }

  const placed = nodes.map((n) => {
    const tier = n.tier in TIER_RADII ? n.tier : "unknown"
    const grp = tierGroups[tier]
    const angle = deterministicAngle(n.productId, grp.indexOf(n), grp.length)
    const r = TIER_RADII[tier]
    return {
      ...n,
      x: r4(cx + Math.cos(angle) * r),
      y: r4(cy + Math.sin(angle) * r),
      color: TIER_COLORS[tier] ?? "#7B7FA6",
      tierKey: tier,
    }
  })

  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full h-full"
      style={{ overflow: "visible" }}
      aria-label="Scent constellation map"
    >
      <defs>
        <radialGradient id="cglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#4FDBCC" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#4FDBCC" stopOpacity={0}   />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <ellipse cx={cx} cy={cy} rx={360} ry={280} fill="url(#cglow)" />

      {/* Background star particles */}
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
      ))}

      {/* Orbital rings (dashed) */}
      {(["crowd-pleaser", "intro-to-niche", "polarizing-art"] as const).map((tier) => (
        <circle
          key={tier}
          cx={cx} cy={cy}
          r={TIER_RADII[tier]}
          fill="none"
          stroke={TIER_COLORS[tier]}
          strokeWidth={0.5}
          strokeDasharray="3 9"
          opacity={0.22}
        />
      ))}

      {/* Zone labels — left side of each ring */}
      {Object.entries(ZONE_LABELS).map(([tier, label]) => (
        <text
          key={tier}
          x={cx - TIER_RADII[tier] - 12}
          y={cy + 4}
          fill={TIER_COLORS[tier]}
          fontSize={6}
          fontFamily="monospace"
          letterSpacing={1.5}
          textAnchor="end"
          opacity={0.35}
        >
          {label}
        </text>
      ))}

      {/* Center origin dot */}
      <circle cx={cx} cy={cy} r={8}   fill="none" stroke="#4FDBCC" strokeWidth={0.6} opacity={0.2} />
      <circle cx={cx} cy={cy} r={2.5} fill="#4FDBCC" opacity={0.55} />

      {/* Full mesh (thin lines between all nodes) */}
      {placed.map((a, i) =>
        placed.slice(i + 1).map((b, j) => (
          <line
            key={`${i}-${j}`}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={0.7}
          />
        ))
      )}

      {/* Nodes */}
      {placed.map((node) => {
        const isFeatured = node.productId === featuredId
        const isSelected = node.productId === selectedId
        const r = isFeatured ? 7.5 : 4.5
        return (
          <g key={node.productId} onClick={() => onSelect(node)} style={{ cursor: "pointer" }}>
            {/* Featured rings */}
            {isFeatured && (
              <>
                <circle cx={node.x} cy={node.y} r={24} fill="none" stroke={node.color} strokeWidth={0.4} opacity={0.18} />
                <circle cx={node.x} cy={node.y} r={14} fill="none" stroke={node.color} strokeWidth={0.7} opacity={0.38} />
              </>
            )}
            {/* Selected ring */}
            {isSelected && !isFeatured && (
              <circle cx={node.x} cy={node.y} r={11} fill="none" stroke={node.color} strokeWidth={0.8} opacity={0.6} />
            )}
            {/* Halo */}
            <circle cx={node.x} cy={node.y} r={r + 6} fill={node.color} opacity={0.08} />
            {/* Dot */}
            <circle
              cx={node.x} cy={node.y} r={r}
              fill={node.color}
              opacity={isSelected || isFeatured ? 1 : 0.68}
            />
            {/* Label */}
            <text
              x={node.x}
              y={node.y - r - 8}
              fill="white"
              fontSize={isFeatured ? 10 : 8}
              textAnchor="middle"
              fontFamily="'Space Grotesk', sans-serif"
              fontWeight={isFeatured ? "600" : "400"}
              opacity={isSelected || isFeatured ? 1 : 0.58}
            >
              {node.title}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
