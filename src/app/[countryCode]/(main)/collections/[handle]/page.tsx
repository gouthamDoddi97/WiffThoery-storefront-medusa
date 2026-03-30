import { Metadata } from "next"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getSiteURL } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const { collections } = await listCollections({
      fields: "*products",
    })

    if (!collections) {
      return []
    }

    const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )

    const collectionHandles = collections.map(
      (collection: StoreCollection) => collection.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string) =>
        collectionHandles.map((handle: string | undefined) => ({
          countryCode,
          handle,
        }))
      )
      .flat()

    return staticParams ?? []
  } catch (error) {
    console.error(`Failed to generate static paths for collection pages: ${error instanceof Error ? error.message : "Unknown error"}.`)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)
  const siteUrl = getSiteURL()

  if (!collection) {
    return { title: "Shop | Whiff Theory", description: "Explore all of our products." }
  }

  const description = `Shop the ${collection.title} collection at Whiff Theory – discover unique fragrances curated for every taste.`

  return {
    title: collection.title,
    description,
    alternates: {
      canonical: `${siteUrl}/${params.countryCode}/collections/${params.handle}`,
    },
    openGraph: {
      title: `${collection.title} | Whiff Theory`,
      description,
      images: [{ url: "/og-image.png", alt: `Whiff Theory – ${collection.title}`, width: 1200, height: 630 }],
      siteName: "Whiff Theory",
    },
    twitter: {
      card: "summary_large_image",
      site: "@whifftheory",
      title: `${collection.title} | Whiff Theory`,
      description,
      images: ["/og-image.png"],
    },
  }
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection: StoreCollection) => collection
  )

  if (!collection) {
    return (
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    )
  }

  const siteUrl = getSiteURL()
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/${params.countryCode}` },
      { "@type": "ListItem", position: 2, name: "Store", item: `${siteUrl}/${params.countryCode}/store` },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.title,
        item: `${siteUrl}/${params.countryCode}/collections/${params.handle}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
      />
    </>
  )
}
