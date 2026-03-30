import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { redirect } from "next/navigation"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { PerfumeDetails } from "@/types/perfume"
import JourneyClient from "./journey-client"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const TIER_HANDLES = ["crowd-pleaser", "intro-to-niche", "polarizing-art"]

async function getProductTier(productId: string): Promise<string> {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}?fields=*categories`,
      {
        headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "" },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) return "unknown"
    const { product } = await res.json()
    const tierCat = (product?.categories ?? []).find((c: { handle: string }) =>
      TIER_HANDLES.includes(c.handle)
    )
    return tierCat?.handle ?? "unknown"
  } catch {
    return "unknown"
  }
}

export const metadata: Metadata = {
  title: "Scent Personality | Whiff Theory",
  description: "Your personal scent personality — fragrance evolution mapped across tiers, notes, and time.",
  robots: { index: false, follow: false },
}

export default async function JourneyPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect("/account")
  }

  const orders = await listOrders(50, 0, undefined, true).catch(() => null)

  // Collect unique product IDs from order line items.
  // Use item.product?.id as a robust fallback since admin-created items may have null product_id.
  const productIds = [
    ...new Set(
      (orders ?? [])
        .flatMap((o) => o.items ?? [])
        .map((item) => (item.product as any)?.id ?? item.product_id)
        .filter(Boolean) as string[]
    ),
  ]

  // Fetch perfume details AND tier category in parallel
  const [perfumeEntries, tierEntries] = await Promise.all([
    Promise.all(
      productIds.map(async (id) => {
        const details = await getPerfumeDetails(id)
        return [id, details] as [string, PerfumeDetails | null]
      })
    ),
    Promise.all(
      productIds.map(async (id) => {
        const tier = await getProductTier(id)
        return [id, tier] as [string, string]
      })
    ),
  ])

  const perfumeMap = Object.fromEntries(
    perfumeEntries.filter(([, v]) => v !== null)
  ) as Record<string, PerfumeDetails>

  const productTierMap = Object.fromEntries(tierEntries) as Record<string, string>

  return (
    <JourneyClient
      customer={customer}
      orders={orders ?? []}
      perfumeMap={perfumeMap}
      productTierMap={productTierMap}
    />
  )
}
