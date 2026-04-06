import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section
      className="relative h-[80vh] flex items-center overflow-hidden bg-surface-lowest"
      aria-label="Hero"
    >
      {/* Background video */}
      <video
        src="/homeHero.webm"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay so text remains legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,13,20,0.88) 0%, rgba(10,13,20,0.72) 50%, rgba(10,13,20,0.30) 100%)",
        }}
      />

      {/* Ambient primary glow — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--primary) 7%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* Ambient secondary glow — top-right */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, color-mix(in srgb, var(--secondary) 5%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="content-container relative z-10">
        <div className="flex flex-col gap-8 max-w-[680px]">
        <span className="eyebrow">WHIFF THEORY — EXTRAIT DE PARFUM</span>

        <h1
          className="font-garamond font-bold text-[clamp(2.8rem,6vw,5.5rem)] text-on-surface leading-[0.9] tracking-[-0.02em]"
        >
          Every fragrance,{" "}
          <span className="text-primary italic">a chapter.</span>
        </h1>

        <p className="font-inter text-lg text-on-surface-variant leading-relaxed max-w-[420px]">
          Three tiers. One journey. Extrait-concentration fragrances crafted
          and bottled in Vizag.
        </p>

        <div className="flex flex-col xsmall:flex-row items-start gap-4">
          <LocalizedClientLink href="/categories/crowd-pleaser">
            <button className="btn-primary">BEGIN THE STORY</button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/store">
            <button className="btn-ghost">EXPLORE THE WARDROBE</button>
          </LocalizedClientLink>
        </div>

        {/* Floating stats */}
        <div className="flex items-center gap-8 mt-4">
          {[
            { value: "3", label: "TIERS" },
            { value: "EXTRAIT", label: "CONCENTRATION" },
            { value: "VIZAG", label: "CRAFTED IN" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="font-grotesk font-bold text-xl text-primary tracking-[-0.02em]">
                {stat.value}
              </span>
              <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-disabled">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Bottom separator line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--primary) 30%, transparent), transparent)",
        }}
      />
    </section>
  )
}

export default Hero
