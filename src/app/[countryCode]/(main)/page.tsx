import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
// import TierShowcase from "@modules/home/components/tier-showcase"
import HeroShowcase from "@modules/home/components/hero-showcase"
import Hero from "@modules/home/components/hero"
import TierCards from "@modules/home/components/tier-cards"
import BrandValues from "@modules/home/components/brand-values"
import FeaturedReviews from "@modules/home/components/featured-reviews"
import OrderAlertBanner from "@modules/common/components/order-alert-banner"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getSiteURL } from "@lib/util/env"


export const metadata: Metadata = {
  title: "Whiff Theory – Artisan Fragrances Crafted in India",
  description:
    "Discover luxury and artisan fragrances at Whiff Theory. Shop Eau de Parfum and Extrait collections crafted in Visakhapatnam — Crowd Pleaser, Intro to Niche, and Polarizing Art tiers.",
  alternates: {
    canonical: `${getSiteURL()}/in`,
  },
  openGraph: {
    title: "Whiff Theory – Artisan Fragrances Crafted in India",
    description:
      "India's most transparent artisan fragrance brand. Luxury Eau de Parfum and Extrait perfumes, handcrafted in Visakhapatnam.",
    images: [{ url: "/og-image.png", alt: "Whiff Theory", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@whifftheory",
    title: "Whiff Theory – Artisan Fragrances Crafted in India",
    description:
      "India's most transparent artisan fragrance brand. Luxury perfumes handcrafted in Visakhapatnam.",
    images: ["/og-image.png"],
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const [regionResult, { collections }] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
  ])

  const region = regionResult

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* FAQ structured data for AI search engines — not rendered visually */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Whiff Theory?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Whiff Theory is an independent Indian artisan fragrance brand based in Visakhapatnam (Vizag), Andhra Pradesh. Founded to give Indians access to genuine extrait-concentration fragrances at honest prices, without celebrity-endorsed mark-ups or diluted formulas. Every fragrance is handcrafted in Vizag and ships with full ingredient transparency.",
                },
              },
              {
                "@type": "Question",
                name: "What fragrance tiers does Whiff Theory offer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Whiff Theory organises its catalogue into three tiers: (1) Crowd Pleaser — universally loved, accessible scents perfect for everyday wear and gifting; (2) Intro to Niche — a stepping stone into artisan perfumery with more character and longevity; (3) Polarizing Art — bold, unconventional compositions for the seasoned fragrance explorer. The tiers form a learning ladder designed to grow with your nose.",
                },
              },
              {
                "@type": "Question",
                name: "Are Whiff Theory perfumes Eau de Parfum or Extrait?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Whiff Theory fragrances are available in Eau de Parfum (EDP) and Extrait de Parfum concentrations. Extrait is typically 20–40% fragrance oil — significantly more concentrated than standard EDPs — delivering greater longevity, projection, and depth per spray.",
                },
              },
              {
                "@type": "Question",
                name: "Where are Whiff Theory perfumes made?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All Whiff Theory fragrances are conceptualised, blended, and bottled in Visakhapatnam (Vizag), Andhra Pradesh, India. The brand sources quality fragrance oils and bases and is proudly 'Crafted in India'.",
                },
              },
              {
                "@type": "Question",
                name: "How does Whiff Theory price its fragrances?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Whiff Theory follows a transparent pricing model: roughly 40% of cost goes to raw ingredients and blending, 25% to bottle and packaging design, 15% to operations and shipping, and 20% is the brand's honest margin. There are no celebrity endorsement fees, import premiums, or boutique overheads built in.",
                },
              },
            ],
          }),
        }}
      />

      {/* Fixed overlay hero — sits above the page, dismisses to reveal content below */}
      <HeroShowcase />

      <OrderAlertBanner />

      <section className="bg-surface-lowest">
        <ul className="flex flex-col divide-y divide-surface-variant/20">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </section>

      {/* Hero */}
      {/* <Hero /> */}

      {/* Tier cards */}
      <TierCards />



      {/* Brand values trio */}
      <BrandValues />

      {/* Featured Reviews */}
      <FeaturedReviews />
    </>
  )
}
