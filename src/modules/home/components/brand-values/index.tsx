const VALUES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    heading: "ART YOU WEAR",
    copy: "Every bottle is a graphic art object designed in Vizag. The packaging is part of the experience.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    heading: "SCENT THAT SPEAKS",
    copy: "Extrait concentration. No watered-down compromises. Maximum projection. Real longevity.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    heading: "JOURNEY NOT CATALOG",
    copy: "Three tiers that evolve with your nose. We don't sell hundreds of options — we sell a progression.",
  },
]

export default function BrandValues() {
  return (
    <section className="bg-surface-low py-24" aria-label="Brand Values">
      <div className="content-container">
        <div className="grid grid-cols-1 small:grid-cols-3 gap-px bg-surface-variant/20">
          {VALUES.map((value) => (
            <div
              key={value.heading}
              className="bg-surface-low px-8 py-12 flex flex-col gap-5"
            >
              <div className="text-primary">{value.icon}</div>
              <h3 className="font-grotesk font-bold text-sm tracking-[0.15em] text-on-surface uppercase">
                {value.heading}
              </h3>
              <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
                {value.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
