"use client"

export type RadarScores = {
  projection:  number  // 0–1
  longevity:   number
  richness:    number
  versatility: number
  depth:       number
}

const AXES: { key: keyof RadarScores; label: string }[] = [
  { key: "projection",  label: "PROJECTION"  },
  { key: "longevity",   label: "LONGEVITY"   },
  { key: "richness",    label: "RICHNESS"    },
  { key: "versatility", label: "VERSATILITY" },
  { key: "depth",       label: "DEPTH"       },
]

function polar(cx: number, cy: number, r: number, idx: number, total: number) {
  const a = (idx / total) * Math.PI * 2 - Math.PI / 2
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }
}

function ring(cx: number, cy: number, maxR: number, scale: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const p = polar(cx, cy, maxR * scale, i, n)
    return `${p.x},${p.y}`
  }).join(" ")
}

export default function ScentRadar({ scores }: { scores: RadarScores }) {
  const cx = 115, cy = 118, maxR = 80, n = AXES.length

  const scorePoly = AXES.map((ax, i) => {
    const v = Math.max(0, Math.min(1, scores[ax.key] ?? 0))
    const p = polar(cx, cy, maxR * v, i, n)
    return `${p.x},${p.y}`
  }).join(" ")

  return (
    <svg viewBox="0 0 230 236" className="w-full max-w-[280px] mx-auto">
      {/* Grid rings */}
      {[0.33, 0.66, 1].map((s, g) => (
        <polygon
          key={g}
          points={ring(cx, cy, maxR, s, n)}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={0.8}
        />
      ))}

      {/* Axis lines */}
      {AXES.map((ax, i) => {
        const p = polar(cx, cy, maxR, i, n)
        return (
          <line
            key={ax.key}
            x1={cx} y1={cy}
            x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.8}
          />
        )
      })}

      {/* Score fill */}
      <polygon
        points={scorePoly}
        fill="rgba(79,219,204,0.12)"
        stroke="#4FDBCC"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {AXES.map((ax, i) => {
        const v = Math.max(0, Math.min(1, scores[ax.key] ?? 0))
        const p = polar(cx, cy, maxR * v, i, n)
        return <circle key={ax.key} cx={p.x} cy={p.y} r={2.5} fill="#4FDBCC" />
      })}

      {/* Axis labels */}
      {AXES.map((ax, i) => {
        const p = polar(cx, cy, maxR + 20, i, n)
        return (
          <text
            key={ax.key}
            x={p.x}
            y={p.y + 3.5}
            textAnchor="middle"
            fontSize={6.5}
            fontFamily="monospace"
            fill="rgba(255,255,255,0.42)"
            letterSpacing={1}
          >
            {ax.label}
          </text>
        )
      })}
    </svg>
  )
}
