import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CardActions from "./card-actions"
import PreviewPrice from "./price"

export default async function ProductPreviewLarge({
  product,
  region,
  compact = false,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  compact?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const details = await getPerfumeDetails(product.id)
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  const allNotes = [details?.top_notes, details?.middle_notes, details?.base_notes]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="group block" data-testid="product-wrapper">
      {/* Clickable area — image + title + description */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        {/* Image — tall, borderless, no bg */}
        <div className={`overflow-hidden w-full ${compact ? "aspect-square max-h-[380px]" : "aspect-[3/5]"}`}>
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

        {/* Character tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-4">
            {product.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-1 rounded-sm border border-white/10 font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled whitespace-nowrap"
              >
                {tag.value}
              </span>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="pt-4 flex flex-col gap-3">
          {/* Collection badge */}
          {product.collection && (
            <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary">
              {product.collection.title}
            </span>
          )}

          {/* Title */}
          <h3
            className={`font-grotesk font-bold text-on-surface tracking-[-0.02em] leading-[0.92] uppercase ${compact ? "text-base small:text-lg" : "text-2xl small:text-3xl"}`}
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Notes — dot-separated */}
          {allNotes && (
            <p className="font-inter text-[10px] tracking-[0.18em] uppercase text-on-surface-disabled leading-relaxed line-clamp-2 max-w-[320px]">
              {allNotes}
            </p>
          )}
        </div>
      </LocalizedClientLink>

      {/* Actions row — outside the link (valid HTML: no interactive elements inside <a>) */}
      <div className="flex items-center justify-between mt-3 pb-2 gap-4">
        {cheapestPrice && (
          <span className="font-grotesk font-semibold text-lg text-on-surface">
            <PreviewPrice price={cheapestPrice} />
          </span>
        )}
        <CardActions
          product={product}
          price={cheapestPrice?.calculated_price}
          colorVariant="primary"
        />
      </div>
    </div>
  )
}
