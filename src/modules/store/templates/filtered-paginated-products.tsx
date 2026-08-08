import { cache } from "react"

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { PerfumeDetails } from "types/perfume"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  computeFilterCounts,
  filterStoreProducts,
  FilterCounts,
  StoreFilters,
} from "@modules/store/lib/store-filters"
import ProductPreview from "@modules/products/components/product-preview"
import ProductPreviewHorizontal from "@modules/products/components/product-preview/horizontal"
import ProductPreviewLarge from "@modules/products/components/product-preview/large"
import ProductSlider from "./product-slider"
import { Pagination } from "@modules/store/components/pagination"
import StoreSidebar from "@modules/store/components/store-sidebar"

const STORE_PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*options,*variants.options,*categories,*collection"

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

function matchesNoteFamilies(
  details: PerfumeDetails | null,
  families: string[]
): boolean {
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

type Layout = "default" | "wave" | "s-curve" | "scattered"

type Props = {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  countryCode: string
  layout?: Layout
  /** Legacy filters — category/collection pages */
  longevity?: string[]
  sillage?: string[]
  notes?: string[]
  /** Shop page filters */
  tier?: string[]
  family?: string[]
  mood?: string[]
  price?: string[]
  /** URL-driven grid pagination (store catalog). Default: client slide pager. */
  paginateWithUrl?: boolean
  productsPerPage?: number
  /** Render shop sidebar + bordered grid (store page only) */
  shopLayout?: boolean
}

export type StoreCatalogData = {
  totalCount: number
  filteredCount: number
  filterCounts: FilterCounts
}

export const getStoreCatalogData = cache(async function getStoreCatalogData(
  countryCode: string,
  sortBy?: SortOptions,
  filters?: StoreFilters
): Promise<{
  region: Awaited<ReturnType<typeof getRegion>>
  products: Awaited<ReturnType<typeof filterStoreProducts>>
  data: StoreCatalogData
}> {
  const region = await getRegion(countryCode)
  if (!region) {
    return {
      region: null,
      products: [],
      data: {
        totalCount: 0,
        filteredCount: 0,
        filterCounts: {
          tier: {},
          family: {},
          mood: {},
          price: {},
        },
      },
    }
  }

  const queryParams: { limit: number; order?: string; fields?: string } = {
    limit: 100,
    fields: STORE_PRODUCT_FIELDS,
  }
  if (sortBy === "created_at") queryParams.order = "created_at"

  const {
    response: { products: allProducts },
  } = await listProductsWithSort({
    page: 1,
    queryParams,
    sortBy,
    countryCode,
  })

  const filterCounts = await computeFilterCounts(allProducts)
  const storeFilters: StoreFilters = filters ?? {
    tier: [],
    family: [],
    mood: [],
    price: [],
  }
  const products = await filterStoreProducts(allProducts, storeFilters)

  return {
    region,
    products,
    data: {
      totalCount: allProducts.length,
      filteredCount: products.length,
      filterCounts,
    },
  }
})

export default async function FilteredPaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  countryCode,
  layout = "default",
  longevity = [],
  sillage = [],
  notes = [],
  tier = [],
  family = [],
  mood = [],
  price = [],
  paginateWithUrl = false,
  productsPerPage = 10,
  shopLayout = false,
}: Props) {
  let region: Awaited<ReturnType<typeof getRegion>>
  let products: Awaited<ReturnType<typeof filterStoreProducts>>
  let allProducts: Awaited<
    ReturnType<typeof listProductsWithSort>
  >["response"]["products"]
  let filterCounts: FilterCounts | undefined

  if (shopLayout) {
    const catalog = await getStoreCatalogData(countryCode, sortBy, {
      tier,
      family,
      mood,
      price,
    })

    if (!catalog.region) return null

    region = catalog.region
    products = catalog.products
    filterCounts = catalog.data.filterCounts
    allProducts = products
  } else {
    region = await getRegion(countryCode)
    if (!region) return null

    const queryParams: {
      limit: number
      collection_id?: string[]
      category_id?: string[]
      order?: string
      fields?: string
    } = {
      limit: 100,
    }

    if (collectionId) queryParams.collection_id = [collectionId]
    if (categoryId) queryParams.category_id = [categoryId]
    if (sortBy === "created_at") queryParams.order = "created_at"

    const {
      response: { products: fetchedProducts },
    } = await listProductsWithSort({
      page: 1,
      queryParams,
      sortBy,
      countryCode,
    })

    allProducts = fetchedProducts
    products = allProducts
  }

  if (!shopLayout) {
    const hasLegacyFilters =
      longevity.length > 0 || sillage.length > 0 || notes.length > 0

    if (hasLegacyFilters) {
      const detailsArr = await Promise.all(
        allProducts.map((p) => getPerfumeDetails(p.id))
      )

      products = allProducts.filter((_, i) => {
        const d = detailsArr[i]
        if (longevity.length > 0 && (!d?.longevity || !longevity.includes(d.longevity)))
          return false
        if (sillage.length > 0 && (!d?.sillage || !sillage.includes(d.sillage)))
          return false
        if (!matchesNoteFamilies(d, notes)) return false
        return true
      })
    }
  }

  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center">
        <p className="font-inter text-sm text-on-surface-variant">
          No fragrances match these filters.
        </p>
        <p className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
          Try removing one or more filters
        </p>
      </div>
    )
  }

  const renderProduct = (p: (typeof products)[number], index: number) => {
    if (layout === "s-curve") {
      return (
        <ProductPreviewHorizontal
          key={`${p.id}-${index}`}
          product={p}
          index={index}
          region={region}
        />
      )
    }
    if (layout === "wave") {
      return (
        <ProductPreviewLarge
          key={`${p.id}-${index}`}
          product={p}
          region={region}
        />
      )
    }
    if (layout === "scattered") {
      return index % 3 === 2 ? (
        <ProductPreviewHorizontal
          key={`${p.id}-${index}`}
          product={p}
          index={Math.floor(index / 3)}
          region={region}
        />
      ) : (
        <ProductPreviewLarge
          key={`${p.id}-${index}`}
          product={p}
          region={region}
        />
      )
    }
    return (
      <ProductPreview
        key={`${p.id}-${index}`}
        product={p}
        region={region}
        showCollectionTier={shopLayout}
      />
    )
  }

  if (paginateWithUrl) {
    const start = (page - 1) * productsPerPage
    const pageProducts = products.slice(start, start + productsPerPage)
    const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage))

    const gridClass = shopLayout
      ? "grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 small:gap-8 items-stretch"
      : "grid grid-cols-1 w-full xsmall:grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-8 items-stretch"

    const grid = (
      <ul className={gridClass} data-testid="products-list">
        {pageProducts.map((p, index) => (
          <li key={p.id} className={shopLayout ? "min-w-0 h-full" : undefined}>
            {renderProduct(p, start + index)}
          </li>
        ))}
      </ul>
    )

    if (!shopLayout) {
      return (
        <div>
          {grid}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              data-testid="product-pagination"
            />
          )}
        </div>
      )
    }

    const sidebarCounts =
      filterCounts ?? (await computeFilterCounts(allProducts))

    return (
      <div className="flex flex-col small:flex-row small:items-start">
        <StoreSidebar
          counts={sidebarCounts}
          tier={tier}
          family={family}
          mood={mood}
          price={price}
        />
        <div className="flex-1 min-w-0 small:pl-8">
          {grid}
          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={page}
                totalPages={totalPages}
                data-testid="product-pagination"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  const productNodes = products.map((p, index) => renderProduct(p, index))

  return <ProductSlider items={productNodes} layout={layout} />
}
