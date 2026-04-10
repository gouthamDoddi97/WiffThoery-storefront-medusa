import { Metadata } from "next"
import { getSiteURL } from "@lib/util/env"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Shop All Fragrances",
  description:
    "Browse every Whiff Theory fragrance — Eau de Parfum, Extrait, Popular, Unique, and IDGF. Luxury Indian perfumes crafted in Visakhapatnam.",
  alternates: {
    canonical: `${getSiteURL()}/in/store`,
  },
  openGraph: {
    title: "Shop All Fragrances | Whiff Theory",
    description:
      "Browse every Whiff Theory fragrance — Eau de Parfum, Extrait, and IDGF. Luxury Indian perfumes crafted in Visakhapatnam.",
    images: [{ url: "/og-image.png", alt: "Whiff Theory Store", width: 1200, height: 630 }],
    siteName: "Whiff Theory",
  },
  twitter: {
    card: "summary_large_image",
    site: "@whifftheory",
    title: "Shop All Fragrances | Whiff Theory",
    description: "Browse every Whiff Theory fragrance — curated luxury Indian perfumes.",
    images: ["/og-image.png"],
  },
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    longevity?: string
    sillage?: string
    notes?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, longevity: longevityStr, sillage: sillageStr, notes: notesStr } = searchParams

  const longevity = longevityStr ? longevityStr.split(",").filter(Boolean) : []
  const sillage = sillageStr ? sillageStr.split(",").filter(Boolean) : []
  const notes = notesStr ? notesStr.split(",").filter(Boolean) : []

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      longevity={longevity}
      sillage={sillage}
      notes={notes}
    />
  )
}
