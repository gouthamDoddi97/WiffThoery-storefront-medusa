"use server"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type PincodeCheck = {
  /** null = check unavailable — never block checkout on it */
  serviceable: boolean | null
  courier_count?: number
  min_days?: number | null
  max_days?: number | null
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
