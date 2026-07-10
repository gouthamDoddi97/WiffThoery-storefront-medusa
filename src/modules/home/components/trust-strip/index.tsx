/**
 * Trust strip — mono data row along the bottom of the home page,
 * matching the fableRedesign mockup footer band.
 */
const ITEMS = [
  {
    title: "CRAFTED IN VIZAG",
    sub: "Small batches. Big intent.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M10 2v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2" />
        <line x1="8" y1="2" x2="16" y2="2" />
        <line x1="7" y1="15" x2="17" y2="15" />
      </svg>
    ),
  },
  {
    title: "CLEAN FORMULAS",
    sub: "IFRA compliant · Cruelty free",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M4 20c0-9 5-16 16-16 0 11-7 16-16 16z" />
        <path d="M4 20c4-6 8-9 12-11" />
      </svg>
    ),
  },
  {
    title: "ARTISANAL PROCESS",
    sub: "Slow blended · Hand bottled",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M12 2.7 6.4 10a7 7 0 1 0 11.2 0L12 2.7z" />
      </svg>
    ),
  },
  {
    title: "BATCH-NUMBERED",
    sub: "Made in India",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <rect x="7" y="8" width="10" height="14" />
        <rect x="9.5" y="2" width="5" height="4" />
        <line x1="9.5" y1="13" x2="14.5" y2="13" />
        <line x1="9.5" y1="16" x2="14.5" y2="16" />
      </svg>
    ),
  },
]

const HAIRLINE = "color-mix(in srgb, var(--on-surface) 28%, transparent)"

export default function TrustStrip({ embedded = false }: { embedded?: boolean }) {
  const content = (
    <div className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-6 small:gap-y-0">
      {ITEMS.map((item, i) => (
        <div
          key={item.title}
          className={`flex items-center gap-3 ${
            i > 0 ? "small:border-l small:pl-6" : ""
          }`}
          style={i > 0 ? { borderColor: HAIRLINE, borderLeftWidth: "var(--hairline-width)" } : undefined}
        >
          <span className="text-on-surface-variant flex-shrink-0">{item.icon}</span>
          <span className="flex flex-col gap-1">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface leading-none">
              {item.title}
            </span>
            <span className="font-mono text-[9px] tracking-[0.08em] text-on-surface-muted leading-none">
              {item.sub}
            </span>
          </span>
        </div>
      ))}
    </div>
  )

  if (embedded) {
    return (
      <div className="pt-6 pb-1 mt-3 small:mt-0 small:pt-6" style={{ borderTop: `var(--hairline-width) solid ${HAIRLINE}` }}>
        {content}
      </div>
    )
  }

  return (
    <section className="border-t rule-ink">
      <div className="content-container py-8">{content}</div>
    </section>
  )
}
