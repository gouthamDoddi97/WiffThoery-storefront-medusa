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
        fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*images",
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

      const allVariants = product.variants ?? []
      const variant = allVariants.find((v) => v.id === item.variant_id)

      let thumbnail: string | undefined
      if (variant) {
        const currentImgIds = new Set(
          ((variant as any)?.images ?? []).map((i: any) => i.id as string)
        )
        const sharedImgIds = new Set(
          allVariants
            .filter((v) => v.id !== variant.id)
            .flatMap((v) => ((v as any)?.images ?? []).map((i: any) => i.id as string))
        )
        const exclusiveIds = Array.from(currentImgIds).filter((id) => !sharedImgIds.has(id))
        const targetIds = exclusiveIds.length > 0 ? new Set(exclusiveIds) : currentImgIds

        const bottle = (product.images ?? [])
          .filter((img) => img.id && targetIds.has(img.id) && img.url && !sceneUrls.has(img.url) && !isBg(img.url))
          .sort((a, b) => ((a as any).rank ?? 0) - ((b as any).rank ?? 0))[0]
        thumbnail = bottle?.url
      }

      return {
        ...item,
        thumbnail: thumbnail ?? item.thumbnail,
      }
    }),
  }))
}
