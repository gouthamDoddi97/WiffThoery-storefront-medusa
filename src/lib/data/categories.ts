import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { filterOnlineProducts } from "@lib/util/product-availability"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category,+metadata",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) =>
      product_categories.map((category) => ({
        ...category,
        products: category.products
          ? filterOnlineProducts(category.products)
          : category.products,
      }))
    )
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products,+metadata",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => {
      const category = product_categories[0]
      if (!category) return category
      return {
        ...category,
        products: category.products
          ? filterOnlineProducts(category.products)
          : category.products,
      }
    })
}
