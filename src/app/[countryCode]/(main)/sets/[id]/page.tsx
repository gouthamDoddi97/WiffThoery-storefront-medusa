import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getOfferById } from "@lib/data/offers"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SetDetailTemplate from "@modules/sets/templates/set-detail"

type Props = {
  params: Promise<{ countryCode: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const set = await getOfferById(id)
  if (!set) return {}
  return {
    title: `${set.title} – Whiff Theory`,
    description: set.description ?? undefined,
  }
}

export default async function SetPage({ params }: Props) {
  const { countryCode, id } = await params

  const [set, region] = await Promise.all([
    getOfferById(id),
    getRegion(countryCode),
  ])

  if (!set || !region) return notFound()

  return <SetDetailTemplate set={set} countryCode={countryCode} />
}
