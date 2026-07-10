import { primaryNoteFromLayer } from "@lib/util/botanical-glyphs"

export type PyramidPlantImages = {
  top: string | null
  heart: string | null
  base: string | null
}

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

function normalizeNoteName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ")
}

async function lookupNoteImages(
  names: string[]
): Promise<Map<string, string | null>> {
  const unique = Array.from(new Set(names.map(normalizeNoteName).filter(Boolean)))
  if (!unique.length) return new Map()

  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/fragrance-notes?names=${encodeURIComponent(unique.join(","))}`,
      {
        next: { revalidate: 3600 },
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )
    if (!res.ok) return new Map()

    const json = await res.json()
    const map = new Map<string, string | null>()
    for (const note of json.fragrance_notes ?? []) {
      map.set(note.name, note.image_url ?? null)
    }
    return map
  } catch {
    return new Map()
  }
}

function imageForLayer(
  notes: string | null | undefined,
  imageMap: Map<string, string | null>
): string | null {
  if (!notes) return null
  const parts = notes
    .split(/[,·]/)
    .map((n) => n.trim())
    .filter(Boolean)

  for (const part of parts) {
    const key = normalizeNoteName(part)
    const url = imageMap.get(key)
    if (url) return url
  }

  const primary = primaryNoteFromLayer(notes)
  if (primary) {
    return imageMap.get(normalizeNoteName(primary)) ?? null
  }

  return null
}

/** Resolve cached note images from the admin fragrance-notes library. */
export async function getPlantImagesForPyramid(
  top?: string | null,
  heart?: string | null,
  base?: string | null
): Promise<PyramidPlantImages> {
  const names = [
    primaryNoteFromLayer(top),
    primaryNoteFromLayer(heart),
    primaryNoteFromLayer(base),
  ].filter(Boolean)

  const imageMap = await lookupNoteImages(names)

  return {
    top: imageForLayer(top, imageMap),
    heart: imageForLayer(heart, imageMap),
    base: imageForLayer(base, imageMap),
  }
}
