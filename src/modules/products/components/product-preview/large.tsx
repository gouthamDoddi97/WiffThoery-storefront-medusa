import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PreviewPrice from "./price"

export default async function ProductPreviewLarge({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div data-testid="product-wrapper">
        {/* Image — tall, borderless, no bg */}
        <div className="overflow-hidden aspect-[3/5] w-full">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>

        {/* Info */}
        <div className="pt-6 pb-2 flex flex-col gap-3">
          {/* Collection badge */}
          {product.collection && (
            <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary">
              {product.collection.title}
            </span>
          )}

          {/* Title */}
          <h3
            className="font-grotesk font-bold text-2xl small:text-3xl text-on-surface tracking-[-0.02em] leading-[0.92] uppercase"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="font-inter text-xs text-on-surface-disabled leading-relaxed line-clamp-2 max-w-[320px]">
              {product.description}
            </p>
          )}

          {/* Price + CTA row */}
          <div className="flex items-center justify-between mt-3 gap-4">
            {cheapestPrice && (
              <span className="font-grotesk font-semibold text-lg text-on-surface">
                <PreviewPrice price={cheapestPrice} />
              </span>
            )}

            {/* Add to Collection */}
            <span className="inline-flex items-center gap-2 border border-primary text-primary font-inter text-[9px] tracking-[0.2em] uppercase px-4 py-2.5 group-hover:bg-primary group-hover:text-surface-lowest transition-all duration-300 whitespace-nowrap flex-shrink-0">
              ADD TO COLLECTION
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
