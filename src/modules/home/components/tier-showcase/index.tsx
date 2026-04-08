import { getCollectionTiers } from "@lib/data/collection-tier"
import TierShowcaseClient, { TierItem } from "./client"

// Video URLs — set NEXT_PUBLIC_VIDEO_* in .env.local to point at a CDN (e.g. Cloudinary).
// Falls back to /public/ files so local dev works without env vars.
const VIDEO_URLS = {
  "popular": process.env.NEXT_PUBLIC_VIDEO_POPULAR ?? "/tier-popular.webm",
  "unique": process.env.NEXT_PUBLIC_VIDEO_UNIQUE ?? "/tier-unique.webm",
  "idgf": process.env.NEXT_PUBLIC_VIDEO_IDGF ?? "/tier-idgf.webm",
} as const

const TIERS_FALLBACK: TierItem[] = [
  {
    number: "TIER 01 / 03",
    name: "POPULAR",
    tagline: "Your entry point. Instantly loved.",
    description:
      "Universally adored, immediately wearable. These fragrances win rooms.",
    href: "/categories/popular",
    handle: "popular",
    accentColor: "#4FDBCC",
    imageUrl: null,
    videoUrl: VIDEO_URLS["popular"],
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
    imageUrl: null,
    videoUrl: VIDEO_URLS["unique"],
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
    imageUrl: null,
    videoUrl: VIDEO_URLS["idgf"],
  },
]

export default async function TierShowcase() {
  const tierMap = await getCollectionTiers()

  const tiers: TierItem[] = TIERS_FALLBACK.map((fallback) => {
    const backend = tierMap[fallback.handle]
    return {
      ...fallback,
      number: backend?.tier_number || fallback.number,
      tagline: backend?.tagline || fallback.tagline,
      description: backend?.description || fallback.description,
      accentColor: backend?.accent_color || fallback.accentColor,
      // Backend image is the fallback when no video is present
      imageUrl: backend?.image_url || fallback.imageUrl,
    }
  })

  // Preload the first tier's video so the browser fetches it alongside the HTML — faster first-frame
  const firstVideoUrl = tiers[0]?.videoUrl

  return (
    <>
      {/* Preload hint — only for the first/active tier; the others load lazily */}
      {firstVideoUrl && (
        <link rel="preload" as="video" href={firstVideoUrl} />
      )}
      <TierShowcaseClient tiers={tiers} />
    </>
  )
}
