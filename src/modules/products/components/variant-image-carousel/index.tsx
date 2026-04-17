"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import ImageCarousel from "@modules/products/components/image-carousel"

type Props = {
  images: { url: string; alt: string }[]
  variants: HttpTypes.StoreProductVariant[]
}

function getSizeNum(variant: HttpTypes.StoreProductVariant): string | null {
  const val = (variant.options?.[0] as any)?.value ?? ""
  return val.match(/^\d+/)?.[0] ?? null
}

export default function VariantImageCarousel({ images, variants }: Props) {
  const searchParams = useSearchParams()
  const vId = searchParams.get("v_id")

  const filteredImages = useMemo(() => {
    const selectedVariant = vId
      ? variants.find((v) => v.id === vId)
      : variants.length === 1
      ? variants[0]
      : null

    const selectedSize = selectedVariant ? getSizeNum(selectedVariant) : null

    if (!selectedSize) return images

    // Collect all known sizes across all variants
    const allSizes = variants
      .map((v) => getSizeNum(v))
      .filter((s): s is string => !!s)

    const otherSizes = allSizes.filter((s) => s !== selectedSize)

    return images.filter((img) => {
      const url = img.url
      const hasOtherSize = otherSizes.some((s) => url.includes(s))
      // Exclude images that belong to a different size
      if (hasOtherSize) return false
      return true
    })
  }, [images, variants, vId])

  return <ImageCarousel images={filteredImages.length > 0 ? filteredImages : images} />
}
