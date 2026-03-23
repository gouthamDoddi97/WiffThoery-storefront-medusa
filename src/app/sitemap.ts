import { MetadataRoute } from "next"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { getBaseURL } from "@lib/util/env"

const COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "in"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL()

  const [productsData, collectionsData, categories] = await Promise.all([
    listProducts({
      countryCode: COUNTRY,
      queryParams: { limit: 100, fields: "handle,updated_at" },
    }).catch(() => ({ response: { products: [] } })),
    listCollections({ fields: "handle,updated_at" }).catch(() => ({
      collections: [],
    })),
    listCategories().catch(() => []),
  ])

  const products: MetadataRoute.Sitemap =
    productsData.response.products.map((p) => ({
      url: `${base}/${COUNTRY}/products/${p.handle}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

  const collections: MetadataRoute.Sitemap = collectionsData.collections.map(
    (c) => ({
      url: `${base}/${COUNTRY}/collections/${c.handle}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  )

  const cats: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${base}/${COUNTRY}/categories/${c.handle}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    {
      url: `${base}/${COUNTRY}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/${COUNTRY}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...products,
    ...collections,
    ...cats,
  ]
}
