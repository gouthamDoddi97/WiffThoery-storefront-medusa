"use client"

import { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ImageCarousel from "@modules/products/components/image-carousel"

type ImageItem = { id: string; url: string; alt: string }

type VariantWithImages = HttpTypes.StoreProductVariant & {
  images?: { id: string; url?: string }[] | null
}

type Props = {
  allImages: ImageItem[]
  variants: VariantWithImages[]
  /** Scene image URLs used in the parallax — must be excluded from carousel */
  sceneUrls?: string[]
  /** Museum placard caption shown under the artwork */
  placard?: string
  /** Tier accent for selected thumbnail border */
  accent?: string
}

export default function VariantImageCarousel({ allImages, variants, sceneUrls = [], placard, accent }: Props) {
  const [variantId, setVariantId] = useState<string | null>(null)

  const excludeSet = useMemo(() => new Set(sceneUrls), [sceneUrls])

  const isBg = (url: string) =>
    /\bbg\b/i.test(decodeURIComponent(url.split("/").pop() ?? ""))

  const keep = (url: string) => !excludeSet.has(url) && !isBg(url)

  // Read initial variant from URL after mount (avoids hydration mismatch)
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("v_id")
    if (initial) setVariantId(initial)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      setVariantId((e as CustomEvent<{ variantId: string | null }>).detail.variantId)
    }
    window.addEventListener("variant-changed", handler)
    return () => window.removeEventListener("variant-changed", handler)
  }, [])

  const selectedVariant = variantId
    ? variants.find((v) => v.id === variantId) ?? null
    : variants.length === 1
    ? variants[0]
    : null

  // Filter variant images using the same scene-url set
  const variantImages = selectedVariant?.images
    ?.filter((i) => !!(i as any).url && keep((i as any).url))
    .map((i) => ({ id: i.id, url: (i as any).url as string, alt: allImages[0]?.alt ?? "" }))

  // IDs of images belonging to the selected variant (used for reordering when URLs aren't present)
  const variantImageIds = selectedVariant?.images?.length
    ? new Set(selectedVariant.images.map((i) => i.id).filter(Boolean))
    : null

  const displayImages = (() => {
    if (variantImages && variantImages.length > 0) return variantImages
    if (variantImageIds) {
      const matching = allImages.filter((img) => variantImageIds.has(img.id))
      if (matching.length > 0) {
        return [...matching, ...allImages.filter((img) => !variantImageIds.has(img.id))]
      }
    }
    return allImages
  })()

  return (
    <ImageCarousel
      key={variantId ?? "default"}
      images={displayImages}
      placard={placard}
      accent={accent}
    />
  )
}
