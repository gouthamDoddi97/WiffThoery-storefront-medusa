import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { PerfumeDetails } from "types/perfume"

export const TIER_HANDLES = ["popular", "unique", "idgf"] as const

export const TIER_OPTIONS = [
  { value: "popular", label: "POPULAR" },
  { value: "unique", label: "UNIQUE" },
  { value: "idgf", label: "IDGF" },
] as const

export const FAMILY_OPTIONS = [
  "Fresh",
  "Floral",
  "Woody",
  "Musky",
  "Spicy",
  "Sweet",
  "Fruity",
  "Amber",
  "Leather",
] as const

export const MOOD_OPTIONS = [
  { value: "comfort", label: "COMFORT" },
  { value: "adventurous", label: "ADVENTUROUS" },
  { value: "intimate", label: "INTIMATE" },
] as const

export const PRICE_OPTIONS = [
  { value: "under_400", label: "UNDER ₹400" },
  { value: "mid", label: "₹400 – ₹700" },
  { value: "over_700", label: "₹700+" },
] as const

const NOTE_KEYWORDS: Record<string, string[]> = {
  Citrus: ["citrus", "lemon", "bergamot", "orange", "grapefruit", "lime", "mandarin", "neroli"],
  Floral: ["floral", "rose", "jasmine", "lily", "violet", "iris", "peony", "magnolia", "ylang", "flower"],
  Woody: ["wood", "cedar", "sandalwood", "vetiver", "oud", "patchouli", "birch", "teak"],
  Musky: ["musk", "musky", "ambergris", "ambrette"],
  Spicy: ["spicy", "pepper", "cardamom", "ginger", "cinnamon", "clove", "nutmeg", "saffron"],
  Fresh: ["fresh", "aquatic", "water", "sea", "marine", "cucumber", "green", "mint", "clean"],
  Sweet: ["sweet", "vanilla", "caramel", "honey", "chocolate", "praline", "sugar"],
  Fruity: ["fruity", "fruit", "peach", "apple", "pear", "berry", "plum", "cherry", "fig", "mango"],
  Amber: ["amber", "ambre", "benzoin", "labdanum", "tonka", "resin", "balsam"],
  Leather: ["leather", "tobacco", "smoke", "incense", "moss", "suede"],
}

const MOOD_KEYWORDS: Record<string, string[]> = {
  comfort: ["comfort", "cozy", "warm", "soft", "calm"],
  adventurous: ["adventurous", "bold", "daring", "wild", "explore"],
  intimate: ["intimate", "close", "personal", "sensual", "romantic"],
}

export type StoreFilters = {
  tier: string[]
  family: string[]
  mood: string[]
  price: string[]
}

export function getProductTier(product: HttpTypes.StoreProduct): string | null {
  const fromCategory =
    product.categories?.find((c) =>
      TIER_HANDLES.includes(c.handle as (typeof TIER_HANDLES)[number])
    )?.handle ?? null
  if (fromCategory) return fromCategory

  const collectionHandle = product.collection?.handle
  if (
    collectionHandle &&
    TIER_HANDLES.includes(collectionHandle as (typeof TIER_HANDLES)[number])
  ) {
    return collectionHandle
  }

  const metaTier = String(product.metadata?.tier ?? "").toLowerCase()
  if (TIER_HANDLES.includes(metaTier as (typeof TIER_HANDLES)[number])) {
    return metaTier
  }

  return null
}

export function getTierLabel(product: HttpTypes.StoreProduct): string | null {
  const handle = getProductTier(product)
  if (!handle) return null
  return TIER_OPTIONS.find((o) => o.value === handle)?.label ?? handle.toUpperCase()
}

export function getCheapestAmount(product: HttpTypes.StoreProduct): number | null {
  const { cheapestPrice } = getProductPrice({ product })
  return cheapestPrice?.calculated_price_number ?? null
}

function matchesFamilies(details: PerfumeDetails | null, families: string[]): boolean {
  if (families.length === 0) return true
  if (!details) return false
  const allNotes = [details.top_notes, details.middle_notes, details.base_notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return families.some((family) => {
    const kws = NOTE_KEYWORDS[family] ?? [family.toLowerCase()]
    return kws.some((kw) => allNotes.includes(kw))
  })
}

function matchesMood(product: HttpTypes.StoreProduct, moods: string[]): boolean {
  if (moods.length === 0) return true
  const tagBlob = (product.tags ?? [])
    .map((t) => t.value?.toLowerCase() ?? "")
    .join(" ")
  const metaMood = String(product.metadata?.mood ?? "").toLowerCase()
  const haystack = `${tagBlob} ${metaMood}`
  return moods.some((mood) => {
    const kws = MOOD_KEYWORDS[mood] ?? [mood]
    return kws.some((kw) => haystack.includes(kw))
  })
}

function matchesPrice(amount: number | null, prices: string[]): boolean {
  if (prices.length === 0) return true
  if (amount == null) return false
  const rupees = amount / 100
  return prices.some((band) => {
    if (band === "under_400") return rupees < 400
    if (band === "mid") return rupees >= 400 && rupees <= 700
    if (band === "over_700") return rupees > 700
    return false
  })
}

function matchesTier(product: HttpTypes.StoreProduct, tiers: string[]): boolean {
  if (tiers.length === 0) return true
  const tier = getProductTier(product)
  return tier ? tiers.includes(tier) : false
}

export async function filterStoreProducts(
  products: HttpTypes.StoreProduct[],
  filters: StoreFilters
): Promise<HttpTypes.StoreProduct[]> {
  const hasFamily = filters.family.length > 0
  const detailsArr = hasFamily
    ? await Promise.all(products.map((p) => getPerfumeDetails(p.id)))
    : []

  return products.filter((product, i) => {
    if (!matchesTier(product, filters.tier)) return false
    if (!matchesMood(product, filters.mood)) return false
    if (!matchesPrice(getCheapestAmount(product), filters.price)) return false
    if (hasFamily && !matchesFamilies(detailsArr[i], filters.family)) return false
    return true
  })
}

export type FilterCounts = {
  tier: Record<string, number>
  family: Record<string, number>
  mood: Record<string, number>
  price: Record<string, number>
}

export async function computeFilterCounts(
  products: HttpTypes.StoreProduct[]
): Promise<FilterCounts> {
  const detailsArr = await Promise.all(products.map((p) => getPerfumeDetails(p.id)))

  const tier: Record<string, number> = {}
  const family: Record<string, number> = {}
  const mood: Record<string, number> = {}
  const price: Record<string, number> = {}

  for (const opt of TIER_OPTIONS) tier[opt.value] = 0
  for (const opt of FAMILY_OPTIONS) family[opt] = 0
  for (const opt of MOOD_OPTIONS) mood[opt.value] = 0
  for (const opt of PRICE_OPTIONS) price[opt.value] = 0

  products.forEach((product, i) => {
    const t = getProductTier(product)
    if (t && t in tier) tier[t]++

    for (const fam of FAMILY_OPTIONS) {
      if (matchesFamilies(detailsArr[i], [fam])) family[fam]++
    }

    for (const opt of MOOD_OPTIONS) {
      if (matchesMood(product, [opt.value])) mood[opt.value]++
    }

    const amount = getCheapestAmount(product)
    for (const opt of PRICE_OPTIONS) {
      if (matchesPrice(amount, [opt.value])) price[opt.value]++
    }
  })

  return { tier, family, mood, price }
}
