import { getPerfumeDetails } from "@lib/data/perfume-details"
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
  const details = await getPerfumeDetails(product.id)

  const allNotes = [details?.top_notes, details?.middle_notes, details?.base_notes]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="group block" data-testid="product-wrapper">
      {/* Image — full-width link */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="overflow-hidden aspect-[3/4] bg-surface-container transition-all duration-300 group-hover:opacity-90">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>
      </LocalizedClientLink>

      {/* Character tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-surface-low border-t border-white/[0.04]">
          {product.tags.slice(0, 5).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded-sm border border-white/10 font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled whitespace-nowrap"
            >
              {tag.value}
            </span>
          ))}
        </div>
      )}

      {/* Info + actions row */}
      <div className="flex items-start gap-3 p-4 bg-surface-low group-hover:bg-surface-container transition-colors duration-300">
        {/* Text content — also a link */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex-1 min-w-0 flex flex-col gap-1.5"
        >
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

          {/* Notes — dot-separated */}
          {allNotes && (
            <p className="font-inter text-[10px] tracking-[0.18em] uppercase text-on-surface-disabled leading-relaxed line-clamp-2">
              {allNotes}
            </p>
          )}

          {/* Price */}
          {cheapestPrice && (
            <div className="mt-0.5">
              <PreviewPrice price={cheapestPrice} />
            </div>
          )}
        </LocalizedClientLink>

        {/* Vertical icons — outside link (no interactive elements inside <a>) */}
        <CardActions
          product={product}
          price={cheapestPrice?.calculated_price}
          colorVariant="default"
          vertical
        />
      </div>
    </div>
  )
}
