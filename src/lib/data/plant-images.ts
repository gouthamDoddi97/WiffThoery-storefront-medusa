import { sdk } from "@lib/config"
import { normalizeNoteName, parseNoteTokens } from "@lib/util/note-tokens"

export type PyramidPlantImage = {
  src: string
  alt: string
}

export type PyramidPlantImages = {
  top: PyramidPlantImage[]
  heart: PyramidPlantImage[]
  base: PyramidPlantImage[]
}

const LAYER_IMAGE_LIMITS = {
  top: 1,
  heart: 2,
  base: 3,
} as const

type FragranceNotesResponse = {
  fragrance_notes: Array<{
    name: string
    display_name: string
    image_url?: string | null
  }>
}

async function lookupNoteImages(
  names: string[]
): Promise<Map<string, string | null>> {
  const unique = Array.from(
    new Set(names.map(normalizeNoteName).filter(Boolean))
  )
  if (!unique.length) return new Map()

  try {
    const { fragrance_notes } = await sdk.client.fetch<FragranceNotesResponse>(
      `/store/fragrance-notes`,
      {
        method: "GET",
        query: { names: unique.join(",") },
        cache: "force-cache",
        next: { revalidate: 3600, tags: ["fragrance-notes"] },
      }
    )

    const map = new Map<string, string | null>()
    for (const note of fragrance_notes ?? []) {
      map.set(note.name, note.image_url ?? null)
    }
    return map
  } catch {
    return new Map()
  }
}

function imagesForLayer(
  notes: string | null | undefined,
  imageMap: Map<string, string | null>,
  max: number
): PyramidPlantImage[] {
  const results: PyramidPlantImage[] = []
  const seen = new Set<string>()

  for (const part of parseNoteTokens(notes)) {
    const key = normalizeNoteName(part)
    if (seen.has(key)) continue

    const url = imageMap.get(key)
    if (!url) continue

    seen.add(key)
    results.push({ src: url, alt: part })
    if (results.length >= max) break
  }

  return results
}

/** Resolve note images from the admin fragrance-notes library. */
export async function getPlantImagesForPyramid(
  top?: string | null,
  heart?: string | null,
  base?: string | null
): Promise<PyramidPlantImages> {
  const names = [
    ...parseNoteTokens(top),
    ...parseNoteTokens(heart),
    ...parseNoteTokens(base),
  ]

  const imageMap = await lookupNoteImages(names)

  return {
    top: imagesForLayer(top, imageMap, LAYER_IMAGE_LIMITS.top),
    heart: imagesForLayer(heart, imageMap, LAYER_IMAGE_LIMITS.heart),
    base: imagesForLayer(base, imageMap, LAYER_IMAGE_LIMITS.base),
  }
}
