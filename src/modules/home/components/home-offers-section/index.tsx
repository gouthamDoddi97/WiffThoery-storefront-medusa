import { getActiveOffers } from "@lib/data/offers"
import { enrichSetThumbnails } from "@lib/data/enrich-set-thumbnails"
import OffersPanel from "@modules/home/components/home-tabs/offers-panel"

export default async function HomeOffersSection({ countryCode }: { countryCode: string }) {
  const raw = await getActiveOffers()

  if (!raw || raw.length === 0) return null

  const sets = await enrichSetThumbnails(raw, countryCode)

  return <OffersPanel sets={sets} />
}
