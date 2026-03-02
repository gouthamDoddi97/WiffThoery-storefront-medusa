"use server"

import { PerfumeDetails } from "@/types/perfume"
import { getCacheOptions } from "./cookies"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export const getPerfumeDetails = async (
  productId: string
): Promise<PerfumeDetails | null> => {
  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/perfume-details`,
      {
        next,
        cache: "force-cache",
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )
    if (!res.ok) return null
    const { perfume_details } = await res.json()
    return perfume_details ?? null
  } catch {
    return null
  }
}
