const VALUES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    eyebrow: "01",
    heading: "Every fragrance, a chapter.",
    copy: "Each scent in our collection carries its own story, mood, and reason to exist. We craft the narrative, you wear it.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    eyebrow: "02",
    heading: "Made to be worn.",
    copy: "Extrait concentration. No watered-down compromises. Real projection, real longevity — designed for skin, not a bottle shelf.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    eyebrow: "03",
    heading: "A wardrobe, not a dump.",
    copy: "Three deliberate tiers that evolve with your nose. Start anywhere. Follow the progression. Build your story.",
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
              <div className="flex items-center gap-3">
                <div className="text-primary">{value.icon}</div>
                <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled">{value.eyebrow}</span>
              </div>
              <h3 className="font-garamond font-semibold text-xl text-on-surface leading-snug">
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
