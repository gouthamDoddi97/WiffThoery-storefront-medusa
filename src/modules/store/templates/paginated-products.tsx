import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import ProductPreviewHorizontal from "@modules/products/components/product-preview/horizontal"
import ProductPreviewLarge from "@modules/products/components/product-preview/large"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ProductSlider from "./product-slider"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  layout = "default",
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  layout?: "default" | "wave" | "s-curve" | "scattered"
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  // TEST MODE: ignore filters, fetch all products across all collections, repeat 2x
  const TEST_ALL_PRODUCTS = true;

  if (!TEST_ALL_PRODUCTS) {
    if (collectionId) {
      queryParams["collection_id"] = [collectionId]
    }

    if (categoryId) {
      queryParams["category_id"] = [categoryId]
    }

    if (productsIds) {
      queryParams["id"] = productsIds
    }
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products: fetchedProducts, count },
  } = await listProductsWithSort({
    page,
    queryParams: { ...queryParams, limit: 100 },
    sortBy,
    countryCode,
  })

  // Repeat 2x for testing with larger numbers
  const products = TEST_ALL_PRODUCTS
    ? [...fetchedProducts, ...fetchedProducts]
    : fetchedProducts

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  // Pre-render product cards on the server; pass as opaque nodes to the client slider
  const productNodes = products.map((p, index) =>
    layout === "s-curve" ? (
      <ProductPreviewHorizontal key={`${p.id}-${index}`} product={p} index={index} region={region} />
    ) : layout === "wave" ? (
      <ProductPreviewLarge key={`${p.id}-${index}`} product={p} region={region} />
    ) : layout === "scattered" ? (
      // Per triplet: positions 0 & 1 = large vertical, position 2 = full-width horizontal
      index % 3 === 2 ? (
        <ProductPreviewHorizontal key={`${p.id}-${index}`} product={p} index={Math.floor(index / 3)} region={region} />
      ) : (
        <ProductPreviewLarge key={`${p.id}-${index}`} product={p} region={region} />
      )
    ) : (
      <ProductPreview key={`${p.id}-${index}`} product={p} region={region} />
    )
  )

  return <ProductSlider items={productNodes} layout={layout} />
}
