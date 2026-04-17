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
}

export default function VariantImageCarousel({ allImages, variants, sceneUrls = [] }: Props) {
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

  const displayImages =
    variantImages && variantImages.length > 0 ? variantImages : allImages

  return <ImageCarousel key={variantId ?? "default"} images={displayImages} />
}
