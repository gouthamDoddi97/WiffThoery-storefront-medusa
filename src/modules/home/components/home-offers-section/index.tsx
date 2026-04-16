import { getActiveOffers } from "@lib/data/offers"
import OffersPanel from "@modules/home/components/home-tabs/offers-panel"

export default async function HomeOffersSection() {
  const sets = await getActiveOffers()

  if (!sets || sets.length === 0) return null

  return <OffersPanel sets={sets} />
}
