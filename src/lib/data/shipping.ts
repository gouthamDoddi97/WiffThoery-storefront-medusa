"use server"

import { revalidateTag } from "next/cache"
import { getCacheTag } from "./cookies"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type PincodeCheck = {
  /** null = check unavailable — never block checkout on it */
  serviceable: boolean | null
  courier_count?: number
  min_days?: number | null
  max_days?: number | null
}

export type ShiprocketCourierOption = {
  courier_company_id: number
  courier_name: string
  rate: number
  etd?: string
  estimated_delivery_days?: number
  label: string
}

export type ShiprocketCouriersResponse = {
  couriers: ShiprocketCourierOption[]
  live: boolean
  weight_kg?: number
  pincode?: string
  error?: string
}

export type TrackingActivity = {
  date: string
  status?: string
  activity: string
  location?: string
}

export type ShipmentTracking = {
  awb: string
  current_status: string
  delivered: boolean
  courier?: string
  etd?: string
  destination?: string
  activities: TrackingActivity[]
}

export const getShipmentTracking = async (
  awb: string
): Promise<{ tracking: ShipmentTracking | null; error: string | null }> => {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/tracking/${encodeURIComponent(awb)}`,
      {
        cache: "no-store",
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      return {
        tracking: null,
        error:
          (data as { error?: string } | null)?.error ??
          "Tracking is unavailable right now.",
      }
    }

    return { tracking: (data as { tracking: ShipmentTracking }).tracking, error: null }
  } catch {
    return { tracking: null, error: "Tracking is unavailable right now." }
  }
}

export const checkPincodeServiceability = async (
  pincode: string
): Promise<PincodeCheck> => {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/shipping/pincode?pincode=${encodeURIComponent(
        pincode
      )}`,
      {
        cache: "no-store",
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )
    if (!res.ok) return { serviceable: null }
    return (await res.json()) as PincodeCheck
  } catch {
    return { serviceable: null }
  }
}

export const listShiprocketCouriers = async (
  pincode: string,
  cartId?: string
): Promise<ShiprocketCouriersResponse> => {
  try {
    const params = new URLSearchParams({ pincode })
    if (cartId) params.set("cart_id", cartId)

    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/shipping/couriers?${params.toString()}`,
      {
        cache: "no-store",
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )

    const data = (await res.json()) as ShiprocketCouriersResponse
    if (!res.ok) {
      return {
        couriers: [],
        live: false,
        error: data.error ?? "Could not load delivery options",
      }
    }

    return data
  } catch {
    return {
      couriers: [],
      live: false,
      error: "Could not load Shiprocket delivery options",
    }
  }
}

export const selectShiprocketCourier = async (input: {
  cartId: string
  courierCompanyId: number
  pincode: string
  courierName?: string
  rate?: number
  etd?: string
  estimatedDeliveryDays?: number
}): Promise<{ error: string | null }> => {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/shipping/select-courier`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify({
          cart_id: input.cartId,
          courier_company_id: input.courierCompanyId,
          pincode: input.pincode,
          ...(input.courierName && input.rate != null
            ? {
                courier_name: input.courierName,
                rate: input.rate,
                etd: input.etd,
                estimated_delivery_days: input.estimatedDeliveryDays,
              }
            : {}),
        }),
      }
    )

    const data = (await res.json()) as { error?: string }
    if (!res.ok) {
      return { error: data.error ?? "Could not select courier" }
    }

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag("carts")
    if (cartCacheTag) {
      revalidateTag(cartCacheTag)
    }

    return { error: null }
  } catch {
    return { error: "Could not select courier" }
  }
}
