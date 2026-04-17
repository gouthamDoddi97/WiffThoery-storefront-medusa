"use server"

import { listProducts } from "@lib/data/products"
import { FragranceSet, SetItem } from "@lib/data/offers"
import { getPerfumeDetails } from "@lib/data/perfume-details"

/**
 * Replaces each set item's thumbnail with the correct variant bottle image.
 * Uses scene URLs from perfume details to exclude parallax/bg images.
 */
export async function enrichSetThumbnails(
  sets: FragranceSet[],
  countryCode: string
): Promise<FragranceSet[]> {
  if (!sets.length) return sets

  const uniqueProductIds = Array.from(
    new Set(sets.flatMap((s) => s.items.map((i) => i.product_id)))
  )

  const [{ response }, ...perfumeDetailsList] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: {
        id: uniqueProductIds as string[],
        limit: uniqueProductIds.length,
      },
    }),
    ...uniqueProductIds.map((pid) => getPerfumeDetails(pid)),
  ])

  const productMap = new Map(response.products.map((p) => [p.id, p]))
  const detailsMap = new Map(
    uniqueProductIds.map((pid, i) => [pid, perfumeDetailsList[i]])
  )

  const isBg = (url: string) =>
    /\bbg\b/i.test(decodeURIComponent(url.split("/").pop() ?? ""))

  return sets.map((set) => ({
    ...set,
    items: set.items.map((item): SetItem => {
      const product = productMap.get(item.product_id)
      if (!product) return item

      const details = detailsMap.get(item.product_id)
      const sceneUrls = new Set(
        [details?.scene_image_1, details?.scene_image_2, details?.scene_image_3]
          .filter(Boolean) as string[]
      )

      const variant = product.variants?.find((v) => v.id === item.variant_id)
      const vImgs = (variant as any)?.images as { id: string; url: string }[] | null

      let thumbnail: string | undefined
      if (vImgs && vImgs.length > 0) {
        const bottle = vImgs.find((img) => img.url && !sceneUrls.has(img.url) && !isBg(img.url))
        thumbnail = bottle?.url
      }

      return {
        ...item,
        thumbnail: thumbnail ?? item.thumbnail,
      }
    }),
  }))
}
