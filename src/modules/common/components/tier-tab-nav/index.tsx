import LocalizedClientLink from "@modules/common/components/localized-client-link"

const TIER_TABS = [
  { number: "01", name: "Popular", handle: "popular", accentClass: "text-primary" },
  { number: "02", name: "Unique", handle: "unique", accentClass: "text-tertiary" },
  { number: "03", name: "IDGF", handle: "idgf", accentClass: "text-secondary" },
] as const

export default function TierTabNav({
  activeHandle,
  basePath,
}: {
  activeHandle: string
  basePath: string
}) {
  return (
    <div
      className="flex mb-8"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.10)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        padding: "10px 0",
      }}
    >
      {TIER_TABS.map((tier, i) => {
        const isActive = tier.handle === activeHandle
        return (
          <LocalizedClientLink
            key={tier.handle}
            href={`${basePath}/${tier.handle}`}
            className={`flex-1 py-1 transition-opacity duration-200 ${
              isActive ? "opacity-100" : "opacity-40 hover:opacity-60"
            } ${i > 0 ? "pl-3" : ""}`}
            style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.08)" } : {}}
          >
            <div className={`font-inter text-[9px] tracking-[0.16em] mb-1 ${tier.accentClass}`}>
              {tier.number}
            </div>
            <div
              className={`font-inter text-[11px] tracking-[0.18em] uppercase ${
                isActive ? `${tier.accentClass} font-semibold` : "text-on-surface"
              }`}
            >
              {tier.name}
            </div>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
