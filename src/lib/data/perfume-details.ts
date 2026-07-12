"use server"

import { sdk } from "@lib/config"
import { PerfumeDetails } from "../../types/perfume"

type PerfumeDetailsListResponse = {
  perfume_details: PerfumeDetails[]
}

type PerfumeDetailsOneResponse = {
  perfume_details: PerfumeDetails | null
}

export async function getPerfumeDetailsMap(
  productIds: string[]
): Promise<Map<string, PerfumeDetails>> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))]
  const map = new Map<string, PerfumeDetails>()

  if (!uniqueIds.length) {
    return map
  }

  try {
    const { perfume_details } = await sdk.client.fetch<PerfumeDetailsListResponse>(
      `/store/perfume-details`,
      {
        method: "GET",
        query: { product_ids: uniqueIds.join(",") },
        cache: "no-store",
      }
    )

    for (const details of perfume_details ?? []) {
      if (details?.product_id) {
        map.set(details.product_id, details)
      }
    }
  } catch {
    // fall through — callers treat missing entries as null
  }

  return map
}

export const getPerfumeDetails = async (
  productId: string
): Promise<PerfumeDetails | null> => {
  try {
    const { perfume_details } = await sdk.client.fetch<PerfumeDetailsOneResponse>(
      `/store/products/${productId}/perfume-details`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
    return perfume_details ?? null
  } catch {
    return null
  }
}
