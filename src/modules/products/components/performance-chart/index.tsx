type Level = "low" | "medium" | "high" | null | undefined

const SEGMENTS = ["low", "medium", "high"] as const

const SILLAGE_LABELS: Record<string, string> = {
  low: "Arm's Length",
  medium: "Moderate",
  high: "Room-Filling",
}

const LONGEVITY_LABELS: Record<string, string> = {
  low: "2–4 Hours",
  medium: "4–8 Hours",
  high: "8+ Hours",
}

function Bar({
  label,
  value,
  color,
  labelMap,
}: {
  label: string
  value: Level
  color: string
  labelMap: Record<string, string>
}) {
  const activeIndex = value ? SEGMENTS.indexOf(value) : -1
  const text = value ? labelMap[value] : "—"

  return (
    <div className="flex items-center gap-3">
      <span className="font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled w-16 shrink-0">
        {label}
      </span>
      <div className="flex flex-1 gap-0.5">
        {SEGMENTS.map((seg, i) => (
          <div
            key={seg}
            className="flex-1 h-1.5 transition-all duration-500"
            style={{
              background: i <= activeIndex ? color : "rgba(255,255,255,0.12)",
            }}
          />
        ))}
      </div>
      <span className="font-inter text-[10px] text-on-surface-variant w-20 text-right shrink-0">
        {text}
      </span>
    </div>
  )
}

export default function PerformanceChart({
  sillage,
  longevity,
  compact = false,
}: {
  sillage: Level
  longevity: Level
  compact?: boolean
}) {
  if (!sillage && !longevity) return null

  return (
    <div className={`flex flex-col gap-3 ${compact ? "" : "py-2"}`}>
      <Bar label="Sillage" value={sillage as Level} color="#4FDBCC" labelMap={SILLAGE_LABELS} />
      <Bar label="Longevity" value={longevity as Level} color="#FFB547" labelMap={LONGEVITY_LABELS} />
    </div>
  )
}
