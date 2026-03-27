"use server"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type UgcGalleryPhoto = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_active: boolean
}

export const listUgcGalleryPhotos = async (): Promise<UgcGalleryPhoto[]> => {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/ugc-gallery`, {
      cache: "no-store",
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
      },
    })

    if (!res.ok) return []

    const { ugc_gallery_photos } = (await res.json()) as {
      ugc_gallery_photos: UgcGalleryPhoto[]
    }

    console.log("Fetched UGC gallery photos:", ugc_gallery_photos)

    return ugc_gallery_photos ?? []
  } catch {
    return []
  }
}
