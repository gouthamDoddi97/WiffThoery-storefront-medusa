import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilteredPaginatedProducts from "./filtered-paginated-products"
import CollectionSidebar from "@modules/collections/components/collection-sidebar"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  longevity = [],
  sillage = [],
  notes = [],
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  longevity?: string[]
  sillage?: string[]
  notes?: string[]
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-surface-lowest">
      <div className="bg-surface-low py-16">
        <div className="content-container">
          <h1
            className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface tracking-[-0.02em]"
            data-testid="store-page-title"
          >
            All Fragrances
          </h1>
          <p className="font-inter text-sm text-on-surface-variant mt-3">
            Every scent, every tier — the full wardrobe.
          </p>
        </div>
      </div>

      <div className="content-container py-16">
        <div className="flex flex-col small:flex-row small:items-start gap-0 small:gap-12">
          <CollectionSidebar
            sortBy={sort}
            longevity={longevity}
            sillage={sillage}
            notes={notes}
          />
          <div className="flex-1 min-w-0">
            <Suspense
              key={`${sort}-${longevity.join()}-${sillage.join()}-${notes.join()}`}
              fallback={<SkeletonProductGrid />}
            >
              <FilteredPaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={countryCode}
                longevity={longevity}
                sillage={sillage}
                notes={notes}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
