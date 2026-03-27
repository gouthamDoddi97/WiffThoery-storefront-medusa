"use server"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type CollectionTierMeta = {
  id: string
  category_id: string
  category_handle: string | null
  tier_number: string | null
  tagline: string | null
  description: string | null
  accent_color: string | null
  next_tier_label: string | null
  next_tier_href: string | null
  next_tier_cta: string | null
  image_url: string | null
}

/**
 * Fetches all collection tier metadata from the backend and returns a map
 * keyed by category_handle for O(1) lookup in templates.
 */
export const getCollectionTiers = async (): Promise<
  Record<string, CollectionTierMeta>
> => {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/collection-tiers`, {
      cache: "no-store",
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
      },
    })
    if (!res.ok) return {}
    const { collection_tiers } = (await res.json()) as {
      collection_tiers: CollectionTierMeta[]
    }
    const map: Record<string, CollectionTierMeta> = {}
    for (const tier of collection_tiers ?? []) {
      const image_url = tier.image_url ?? tier.imageUrl ?? null
      if (tier.category_handle) {
        map[tier.category_handle] = {
          ...tier,
          image_url,
        }
      }
    }
    return map
  } catch {
    return {}
  }
}
