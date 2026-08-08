import "server-only"

import { cache } from "react"
import { HttpTypes } from "@medusajs/types"

import { listProducts } from "./products"

/** Dedupes product fetches between generateMetadata and the page component. */
export const getProductByHandle = cache(
  async (
    countryCode: string,
    handle: string
  ): Promise<HttpTypes.StoreProduct | null> => {
    const { response } = await listProducts({
      countryCode,
      queryParams: { handle },
    })

    return response.products[0] ?? null
  }
)
