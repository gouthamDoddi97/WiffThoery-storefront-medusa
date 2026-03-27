import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCollectionTiers, CollectionTierMeta } from "@lib/data/collection-tier"

const TIERS_FALLBACK = [
  {
    number: "TIER 01 / 03",
    name: "CROWD PLEASERS",
    tagline: "Your entry point. Instantly loved.",
    description:
      "Universally adored, immediately wearable. These fragrances win rooms.",
    href: "/categories/crowd-pleaser",
    handle: "crowd-pleaser",
    accentColor: "#4FDBCC",
  },
  {
    number: "TIER 02 / 03",
    name: "INTRO TO NICHE",
    tagline: "For the curious nose.",
    description:
      "Beyond the mainstream. Scents that reward attention and develop over time.",
    href: "/categories/intro-to-niche",
    handle: "intro-to-niche",
    accentColor: "#FFB547",
  },
  {
    number: "TIER 03 / 03",
    name: "POLARIZING ART",
    tagline: "Not for everyone. Maybe for you.",
    description:
      "Challenging, unforgettable, unapologetically complex. Only the committed need apply.",
    href: "/categories/polarizing-art",
    handle: "polarizing-art",
    accentColor: "#FF6B5A",
  },
]

// Helper to merge backend data over fallback
function buildTierData(backend: CollectionTierMeta | undefined, fallback: typeof TIERS_FALLBACK[0]) {
  return {
    number: backend?.tier_number || fallback.number,
    name: fallback.name, // UI display name stays hardcoded
    tagline: backend?.tagline || fallback.tagline,
    description: backend?.description || fallback.description,
    href: fallback.href,
    handle: fallback.handle,
    accentColor: backend?.accent_color || fallback.accentColor,
    imageUrl: backend?.image_url || null,
  }
}

export default async function TierCards() {
  // Fetch tier data from backend
  const tierMap = await getCollectionTiers()
  
  // Merge backend data over fallbacks
  const tiers = TIERS_FALLBACK.map((fallback) =>
    buildTierData(tierMap[fallback.handle], fallback)
  )

  return (
    <section className="bg-surface-lowest py-24" aria-label="Olfactory Evolution">
      <div className="content-container">
        {/* Section heading */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="eyebrow">THE OLFACTORY EVOLUTION</span>
          <h2 className="section-heading text-3xl small:text-4xl">
            Three Tiers. One Journey.
          </h2>
        </div>

        {/* Cards grid — gap-6 so cards are visually separated */}
        <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <LocalizedClientLink key={tier.handle} href={tier.href}>
              <div
                className="relative bg-surface-low overflow-hidden flex flex-col group transition-colors duration-300 hover:bg-surface-container"
                style={{ minHeight: "300px" }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] group-hover:w-[4px] transition-all duration-300 z-20"
                  style={{ backgroundColor: tier.accentColor }}
                />

                {/* Category image — right-half bleed */}
                {tier.imageUrl && (
                  <>
                    <img
                      src={tier.imageUrl}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover object-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                    />
                    {/* Stronger left-to-right mask keeps copy readable and art visible on the right */}
                    <div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(23,27,40,0.96) 0%, rgba(23,27,40,0.9) 28%, rgba(23,27,40,0.72) 52%, rgba(23,27,40,0.42) 74%, rgba(23,27,40,0.14) 100%)",
                      }}
                    />
                  </>
                )}

                {/* Content */}
                <div className="relative z-10 p-8 py-10 flex flex-col gap-4 flex-1">
                  {/* Tier number */}
                  <span
                    className="font-inter text-[10px] tracking-[0.25em] uppercase"
                    style={{ color: tier.accentColor }}
                  >
                    {tier.number}
                  </span>

                  {/* Name */}
                  <h3 className="font-grotesk font-bold text-xl text-on-surface tracking-[-0.01em] leading-tight">
                    {tier.name}
                  </h3>

                  {/* Tagline */}
                  <p
                    className="font-inter text-sm italic"
                    style={{ color: tier.accentColor }}
                  >
                    {tier.tagline}
                  </p>

                  {/* Description */}
                  <p className="font-inter text-sm text-on-surface-variant leading-relaxed flex-1">
                    {tier.description}
                  </p>

                  {/* CTA arrow */}
                  <div
                    className="flex items-center gap-2 font-inter text-xs tracking-[0.15em] uppercase transition-colors duration-200 mt-2"
                    style={{ color: tier.accentColor }}
                  >
                    <span>EXPLORE</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
