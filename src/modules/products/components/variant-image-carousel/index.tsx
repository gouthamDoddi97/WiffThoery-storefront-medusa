"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ImageCarousel from "@modules/products/components/image-carousel"

type ImageItem = { id: string; url: string; alt: string }

type VariantWithImages = HttpTypes.StoreProductVariant & {
  images?: { id: string }[] | null
}

type Props = {
  allImages: ImageItem[]
  variants: VariantWithImages[]
}

export default function VariantImageCarousel({ allImages, variants }: Props) {
  const [variantId, setVariantId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return new URLSearchParams(window.location.search).get("v_id")
  })

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

  const variantImageIds = selectedVariant?.images?.map((i) => i.id) ?? []

  const filteredImages =
    variantImageIds.length > 0
      ? allImages.filter((img) => variantImageIds.includes(img.id))
      : allImages

  const displayImages = filteredImages.length > 0 ? filteredImages : allImages

  return <ImageCarousel key={variantId ?? "default"} images={displayImages} />
}
