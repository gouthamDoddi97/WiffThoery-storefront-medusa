import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import CardActions from "./card-actions"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <div className="group block" data-testid="product-wrapper">
      {/* Clickable area — image + title + price navigates to product page */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="bg-surface-low transition-all duration-300 group-hover:bg-surface-container group-hover:shadow-card-hover">
          {/* Product image */}
          <div className="overflow-hidden aspect-[3/4] bg-surface-container">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
            />
          </div>

          {/* Product info */}
          <div className="p-5 pb-3 flex flex-col gap-2">
            {/* Collection badge */}
            {product.collection && (
              <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary">
                {product.collection.title}
              </span>
            )}

            {/* Title */}
            <h3
              className="font-grotesk font-semibold text-on-surface text-sm tracking-[-0.01em] leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>

            {/* Price */}
            {cheapestPrice && (
              <div className="mt-1">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </LocalizedClientLink>

      {/* Actions row — outside the link (valid HTML: no interactive elements inside <a>) */}
      <div className="flex items-center justify-between px-5 pt-2 pb-4 bg-surface-low group-hover:bg-surface-container transition-colors duration-300">
        <CardActions
          product={product}
          price={cheapestPrice?.calculated_price}
          colorVariant="default"
        />
      </div>
    </div>
  )
}
