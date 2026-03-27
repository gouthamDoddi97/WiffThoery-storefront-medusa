import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import TierCards from "@modules/home/components/tier-cards"
import BrandValues from "@modules/home/components/brand-values"
import UGCGallery from "@modules/home/components/ugc-gallery"
import OrderAlertBanner from "@modules/common/components/order-alert-banner"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Whiff Theory",
  description:
    "Discover luxury and artisan fragrances at Whiff Theory. Explore our curated perfume collections crafted for every mood and occasion.",
  openGraph: {
    title: "Whiff Theory – Curated Fragrance Collections",
    description:
      "Discover luxury and artisan fragrances at Whiff Theory. Explore our curated perfume collections crafted for every mood and occasion.",
    images: [{ url: "/Wlogo.png", alt: "Whiff Theory" }],
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
      <OrderAlertBanner />

      {/* 1. Hero — full viewport brand statement */}
      <Hero />

      {/* 2. Tier cards — Olfactory Evolution */}
      <TierCards />

      {/* 3. Art Objects — featured products per collection */}
      <section className="bg-surface-lowest py-4" aria-label="Art Objects">
        <div className="content-container pt-16 pb-4">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">CURRENTLY FEATURED</span>
            <h2 className="section-heading text-2xl small:text-3xl">ART OBJECTS</h2>
          </div>
        </div>
        <ul className="flex flex-col divide-y divide-surface-variant/20">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </section>

      {/* 4. Brand values trio */}
      <BrandValues />

      {/* 5. UGC Gallery */}
      <UGCGallery />
    </>
  )
}
