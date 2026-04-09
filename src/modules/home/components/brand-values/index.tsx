import FadeIn from "@modules/common/components/fade-in"

const VALUES = [
  {
    numeral: "I",
    heading: "Every fragrance, a chapter.",
    copy: "Each scent in our collection carries its own story, mood, and reason to exist. We craft the narrative, you wear it.",
  },
  {
    numeral: "II",
    heading: "Made to be worn.",
    copy: "Extrait concentration. No watered-down compromises. Real projection, real longevity — designed for skin, not a bottle shelf.",
  },
  {
    numeral: "III",
    heading: "A wardrobe, not a dump.",
    copy: "Three deliberate tiers that evolve with your nose. Start anywhere. Follow the progression. Build your story.",
  },
]

export default function BrandValues() {
  return (
    <section className="relative bg-surface-low py-24 overflow-hidden" aria-label="Brand Values">
      {/* Video background */}
      <video
        src="/homeHero.webm"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      <div className="content-container relative z-10">
        <div className="grid grid-cols-1 small:grid-cols-3 gap-px bg-surface-variant/15">
          {VALUES.map((value, index) => (
            <FadeIn key={value.heading} delay={index * 120}>
              <div className="bg-surface-low/80 px-8 py-12 flex flex-col gap-5 h-full">

                <span
                  className="font-garamond italic text-5xl leading-none select-none"
                  style={{ color: "color-mix(in srgb, var(--primary) 30%, transparent)" }}
                >
                  {value.numeral}
                </span>

                <h3 className="font-garamond italic font-normal text-xl text-on-surface leading-snug">
                  {value.heading}
                </h3>

                <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
                  {value.copy}
                </p>

              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
