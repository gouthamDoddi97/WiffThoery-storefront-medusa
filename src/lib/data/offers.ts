"use server"

import { sdk } from "@lib/config"

export type SetItem = {
  product_id: string
  variant_id: string
  product_title: string
  variant_title: string
  thumbnail: string | null
}

export type FragranceSet = {
  id: string
  title: string
  description: string | null
  price_amount: number
  currency_code: string
  items: SetItem[]
  is_active: boolean
  badge: string | null
  tags: string | null
  usage_tips: string | null
  ingredients: string | null
  brand_info: string | null
  created_at: string
}

export const getActiveOffers = async (): Promise<FragranceSet[]> => {
  try {
    const data = await sdk.client.fetch<{ sets: FragranceSet[] }>("/store/offers", {
      next: { tags: ["offers"], revalidate: 60 },
      cache: "force-cache",
    })
    return data.sets ?? []
  } catch {
    return []
  }
}

export const getOfferById = async (id: string): Promise<FragranceSet | null> => {
  try {
    const data = await sdk.client.fetch<{ set: FragranceSet }>(`/store/offers/${id}`, {
      next: { tags: [`offer-${id}`], revalidate: 60 },
      cache: "force-cache",
    })
    return data.set ?? null
  } catch {
    return null
  }
}
