import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections, listCollectionBackgrounds } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Whiff Theory",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [regionResult, { collections }, backgrounds] = await Promise.all([
    getRegion(countryCode),
    listCollections({ fields: "id, handle, title" }),
    listCollectionBackgrounds().catch(() => []),
  ])

  const region = regionResult

  if (!collections || !region) {
    return null
  }

  // Build carousel slides from collections that have a background video
  const bgMap = new Map(backgrounds.map((b) => [b.collection_id, b]))
  const carouselSlides = collections
    .filter((c) => bgMap.has(c.id))
    .map((c) => {
      const bg = bgMap.get(c.id)!
      return {
        src: bg.file_url,
        mobileSrc: bg.mobile_image_url ?? undefined,
        title: c.title,
        description: bg.description ?? "",
        badge: bg.badge ?? "",
        fontColorPallette: (bg.font_color_palette ?? "light") as "light" | "dark",
      }
    })

  return (
    <>
      <Hero slides={carouselSlides} />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}
