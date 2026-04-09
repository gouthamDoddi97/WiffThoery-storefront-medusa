import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FadeIn from "@modules/common/components/fade-in"
import { getCollectionTiers, CollectionTierMeta } from "@lib/data/collection-tier"

const TIERS_FALLBACK = [
  {
    number: "TIER 01 / 03",
    name: "POPULAR",
    tagline: "Your entry point. Instantly loved.",
    description:
      "Universally adored, immediately wearable. These fragrances win rooms.",
    href: "/categories/popular",
    handle: "popular",
    accentColor: "#4FDBCC",
  },
  {
    number: "TIER 02 / 03",
    name: "UNIQUE",
    tagline: "For the curious nose.",
    description:
      "Beyond the mainstream. Scents that reward attention and develop over time.",
    href: "/categories/unique",
    handle: "unique",
    accentColor: "#FFB547",
  },
  {
    number: "TIER 03 / 03",
    name: "IDGF",
    tagline: "Not for everyone. Maybe for you.",
    description:
      "Challenging, unforgettable, unapologetically complex. Only the committed need apply.",
    href: "/categories/idgf",
    handle: "idgf",
    accentColor: "#FF6B5A",
  },
]

function buildTierData(backend: CollectionTierMeta | undefined, fallback: typeof TIERS_FALLBACK[0]) {
  return {
    number: backend?.tier_number || fallback.number,
    name: fallback.name,
    tagline: backend?.tagline || fallback.tagline,
    description: backend?.description || fallback.description,
    href: fallback.href,
    handle: fallback.handle,
    accentColor: backend?.accent_color || fallback.accentColor,
    imageUrl: backend?.image_url || null,
  }
}

export default async function TierCards() {
  const tierMap = await getCollectionTiers()
  const tiers = TIERS_FALLBACK.map((fallback) =>
    buildTierData(tierMap[fallback.handle], fallback)
  )

  return (
    <section className="bg-surface-lowest py-24" aria-label="Olfactory Evolution">
      <div className="content-container">

        {/* Section heading */}
        <FadeIn className="flex flex-col gap-2 mb-14">
          <span className="eyebrow">THE OLFACTORY EVOLUTION</span>
          <h2 className="font-garamond italic font-normal text-3xl small:text-4xl text-on-surface tracking-[-0.01em]">
            Three Tiers. One Journey.
          </h2>
        </FadeIn>

        {/* Cards grid */}
        <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <FadeIn key={tier.handle} delay={index * 120}>
              <LocalizedClientLink href={tier.href}>
                <div
                  className="relative bg-surface-low overflow-hidden flex flex-col group transition-all duration-500 hover:bg-surface-container"
                  style={{ minHeight: "300px" }}
                >
                  {/* Top accent line — replaces the left bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[1px] z-20 transition-all duration-500"
                    style={{ backgroundColor: tier.accentColor }}
                  />

                  {/* Category image — full bleed with cinematic gradient */}
                  {tier.imageUrl && (
                    <>
                      <img
                        src={tier.imageUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-25 group-hover:opacity-45 transition-opacity duration-700"
                      />
                      {/* Bottom-to-top gradient — content stays legible, image shows on top half */}
                      <div
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(23,27,40,0.98) 0%, rgba(23,27,40,0.85) 40%, rgba(23,27,40,0.50) 70%, rgba(23,27,40,0.20) 100%)",
                        }}
                      />
                    </>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-8 py-10 flex flex-col gap-4 flex-1">

                    <span
                      className="font-inter text-[9px] tracking-[0.32em] uppercase"
                      style={{ color: tier.accentColor }}
                    >
                      {tier.number}
                    </span>

                    {/* Name — Garamond italic for luxury */}
                    <h3
                      className="font-garamond italic font-normal text-2xl text-on-surface leading-tight"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {tier.name}
                    </h3>

                    <p
                      className="font-garamond italic text-base"
                      style={{ color: tier.accentColor }}
                    >
                      {tier.tagline}
                    </p>

                    {/* Thin rule */}
                    <div className="h-px w-12" style={{ background: "rgba(255,255,255,0.08)" }} />

                    <p className="font-inter text-sm text-on-surface-variant leading-relaxed flex-1">
                      {tier.description}
                    </p>

                    {/* CTA */}
                    <div
                      className="flex items-center gap-2.5 font-inter text-[10px] tracking-[0.2em] uppercase transition-all duration-300 mt-1 group-hover:gap-3"
                      style={{ color: tier.accentColor }}
                    >
                      <span
                        className="block h-px transition-all duration-500 group-hover:w-6"
                        style={{ background: tier.accentColor, width: "14px" }}
                      />
                      <span>Explore</span>
                      <svg
                        width="11" height="11" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </LocalizedClientLink>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
