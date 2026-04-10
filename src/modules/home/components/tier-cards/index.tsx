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
        <div className="grid grid-cols-1 small:grid-cols-3 gap-4 small:gap-6">
          {tiers.map((tier, index) => (
            <FadeIn key={tier.handle} delay={index * 120}>
              <LocalizedClientLink href={tier.href}>
                <div
                  className="relative overflow-hidden flex flex-col group transition-all duration-500"
                  style={{ minHeight: "420px", background: "#0F111A" }}
                >
                  {/* Thick top accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] z-20"
                    style={{ backgroundColor: tier.accentColor }}
                  />

                  {/* Background image */}
                  {tier.imageUrl && (
                    <>
                      <img
                        src={tier.imageUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-40 group-hover:opacity-60 transition-opacity duration-700"
                      />
                      {/* Bottom-to-top gradient — keeps copy readable */}
                      <div
                        className="absolute inset-0 pointer-events-none z-10"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(10,13,20,0.98) 0%, rgba(10,13,20,0.88) 35%, rgba(10,13,20,0.55) 65%, rgba(10,13,20,0.15) 100%)",
                        }}
                      />
                    </>
                  )}

                  {/* Ambient glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"
                    style={{ background: `radial-gradient(ellipse at bottom left, ${tier.accentColor}18 0%, transparent 65%)` }}
                  />

                  {/* Content */}
                  <div className="relative z-20 p-7 small:p-8 flex flex-col flex-1">

                    <span
                      className="font-inter text-[9px] tracking-[0.35em] uppercase mb-auto pb-8"
                      style={{ color: tier.accentColor }}
                    >
                      {tier.number}
                    </span>

                    {/* Name — big, bold, display size */}
                    <div>
                      <h3
                        className="font-grotesk font-bold text-on-surface leading-[0.88] tracking-[-0.03em]"
                        style={{ fontSize: "clamp(2.4rem, 5vw, 3.2rem)" }}
                      >
                        {tier.name}
                      </h3>

                      <p
                        className="font-inter text-sm italic mt-3"
                        style={{ color: tier.accentColor }}
                      >
                        {tier.tagline}
                      </p>

                      <p className="font-inter text-sm text-on-surface-variant leading-relaxed mt-3 line-clamp-3">
                        {tier.description}
                      </p>

                      {/* CTA */}
                      <div className="mt-6">
                        <span
                          className="inline-flex items-center gap-2.5 font-inter text-[10px] tracking-[0.22em] uppercase px-4 py-2.5 transition-all duration-300"
                          style={{
                            border: `1px solid ${tier.accentColor}60`,
                            color: tier.accentColor,
                          }}
                        >
                          EXPLORE
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </span>
                      </div>
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
