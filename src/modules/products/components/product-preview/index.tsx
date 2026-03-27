import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
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
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div
        data-testid="product-wrapper"
        className="bg-surface-low transition-all duration-300 group-hover:bg-surface-container group-hover:shadow-card-hover"
      >
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
        <div className="p-5 flex flex-col gap-2">
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

          {/* View link */}
          <div className="flex items-center gap-1 mt-2 font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant group-hover:text-primary transition-colors duration-200">
            <span>VIEW</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
