import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilteredPaginatedProducts, {
  getStoreCatalogData,
} from "./filtered-paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  tier = [],
  family = [],
  mood = [],
  price = [],
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  tier?: string[]
  family?: string[]
  mood?: string[]
  price?: string[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  const { data } = await getStoreCatalogData(countryCode, sort, {
    tier,
    family,
    mood,
    price,
  })

  const scentCount = String(data.filteredCount).padStart(2, "0")

  return (
    <div className="bg-surface-lowest">
      <div className="border-b rule-ink">
        <div className="content-container py-4">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-muted block mb-2">
            HOME / SHOP
          </span>
          <h1
            className="font-garamond serif-display font-medium text-4xl small:text-5xl text-on-surface"
            style={{ fontStyle: "normal" }}
            data-testid="store-page-title"
          >
            All fragrances
          </h1>
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-variant mt-2">
            {scentCount} SCENTS
          </p>
        </div>
      </div>

      <div className="content-container py-10 small:py-12">
        <Suspense
          key={`${sort}-${tier.join()}-${family.join()}-${mood.join()}-${price.join()}-${pageNumber}`}
          fallback={<SkeletonProductGrid />}
        >
          <FilteredPaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            tier={tier}
            family={family}
            mood={mood}
            price={price}
            paginateWithUrl
            productsPerPage={6}
            shopLayout
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
