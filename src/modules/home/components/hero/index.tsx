import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeIn from "@modules/common/components/fade-in"

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

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(10,13,20,0.86) 0%, rgba(10,13,20,0.65) 50%, rgba(10,13,20,0.20) 100%)",
        }}
      />

      {/* Ambient primary glow — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 70%)",
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

          <FadeIn delay={0}>
            <span className="eyebrow">WHIFF THEORY — EXTRAIT DE PARFUM</span>
          </FadeIn>

          <FadeIn delay={100}>
            <h1
              className="font-garamond font-bold text-[clamp(2.8rem,6vw,5.5rem)] text-on-surface leading-[0.9] tracking-[-0.02em]"
            >
              Every fragrance,{" "}
              <span className="text-primary italic">a chapter.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="font-inter text-base text-on-surface-variant leading-relaxed max-w-[380px]">
              Three tiers. One journey. Extrait-concentration fragrances crafted
              and bottled in Vizag.
            </p>
          </FadeIn>

          {/* CTAs — text-link style, no chunky boxes */}
          <FadeIn delay={300}>
            <div className="flex flex-col xsmall:flex-row items-start gap-5">
              <LocalizedClientLink href="/categories/crowd-pleaser">
                <button className="group flex items-center gap-3 font-inter text-[11px] tracking-[0.22em] uppercase text-primary transition-all duration-300">
                  <span
                    className="block h-px bg-primary transition-all duration-500 group-hover:w-12"
                    style={{ width: "20px" }}
                  />
                  <span className="transition-all duration-300 group-hover:tracking-[0.28em]">
                    Begin the Story
                  </span>
                  <svg
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </LocalizedClientLink>

              <LocalizedClientLink href="/store">
                <button className="font-inter text-[11px] tracking-[0.22em] uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-300 flex items-center gap-2">
                  Explore All
                  <svg
                    width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </LocalizedClientLink>
            </div>
          </FadeIn>

          {/* Stats row */}
          <FadeIn delay={420}>
            <div className="flex items-center gap-8 pt-2">
              {[
                { value: "3", label: "TIERS" },
                { value: "EXTRAIT", label: "CONCENTRATION" },
                { value: "VIZAG", label: "CRAFTED IN" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex flex-col gap-0.5">
                  <span className="font-garamond italic text-2xl text-primary leading-none">
                    {stat.value}
                  </span>
                  <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>

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
