import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getBaseURL, getSiteURL } from "@lib/util/env"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

    const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    const categoryHandles = product_categories.map(
      (category: any) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        categoryHandles.map((handle: any) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams ?? []
  } catch (error) {
    console.error(`Failed to generate static paths for category pages: ${error instanceof Error ? error.message : "Unknown error"}.`)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name
    const description = productCategory.description ?? `${title} category.`

    return {
      title,
      description,
      alternates: {
        canonical: `${getBaseURL()}/${params.countryCode}/categories/${params.category.join("/")}`,
      },
      openGraph: {
        title: `${title} | Whiff Theory`,
        description,
        images: [{ url: "/og-image.png", alt: `Whiff Theory – ${title}`, width: 1200, height: 630 }],
        siteName: "Whiff Theory",
      },
      twitter: {
        card: "summary_large_image",
        site: "@whifftheory",
        title: `${title} | Whiff Theory`,
        description,
        images: ["/og-image.png"],
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
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
        name: productCategory.name,
        item: `${siteUrl}/${params.countryCode}/categories/${params.category.join("/")}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    </>
  )
}
