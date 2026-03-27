import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CardActions from "./card-actions"
import PreviewPrice from "./price"

export default async function ProductPreviewHorizontal({
  product,
  index,
  region,
}: {
  product: HttpTypes.StoreProduct
  index: number
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const details = await getPerfumeDetails(product.id)

  // Combine all note categories into a single dot-separated line
  const allNotes = [details?.top_notes, details?.middle_notes, details?.base_notes]
    .filter(Boolean)
    .join(" · ")

  const description = details?.scent_story || product.description

  const thumbnail = product.thumbnail || product.images?.[0]?.url
  const seriesLabel = `SERIES II / ${String(index + 1).padStart(2, "0")}`
  const isReversed = index % 2 === 1 // alternate: even = image-left, odd = image-right

  const imageBlock = (
    <div className="relative w-[36%] flex-shrink-0 overflow-hidden">
      <div className="aspect-[3/4] w-full">
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
    </div>
  )

  // Info block WITHOUT the footer actions row (pulled outside the <a> tag)
  const infoBlock = (
    <div className="flex-1 flex flex-col justify-center px-10 py-10 small:px-14 small:py-12 gap-5 pb-4 small:pb-4">
      {/* Series label */}
      <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-tertiary">
        {seriesLabel}
      </span>

      {/* Title */}
      <h3 className="font-grotesk font-bold text-4xl small:text-[3.2rem] text-on-surface tracking-[-0.03em] leading-[0.88] uppercase">
        {product.title}
      </h3>

      {/* Notes */}
      {allNotes && (
        <p className="font-inter text-[10px] tracking-[0.22em] uppercase text-on-surface-disabled">
          {allNotes}
        </p>
      )}

      {/* Description / scent story */}
      {description && (
        <p className="font-inter text-sm text-on-surface-variant leading-relaxed max-w-[420px] line-clamp-3">
          {description}
        </p>
      )}
    </div>
  )

  // Footer padding aligns with the info column content:
  //   Normal  (image-left):  skip image (36%) + info left-padding (px-10/px-14)
  //   Reversed (info-left):  just info left-padding (px-10/px-14)
  const footerPadding = isReversed
    ? "pl-10 small:pl-14 pr-10 small:pr-14"
    : "pl-[calc(36%+2.5rem)] small:pl-[calc(36%+3.5rem)] pr-10 small:pr-14"

  return (
    <div className="group block">
      {/* Clickable area — image + title + description navigate to product page */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="flex overflow-hidden transition-colors duration-500">
          {isReversed ? (
            <>{infoBlock}{imageBlock}</>
          ) : (
            <>{imageBlock}{infoBlock}</>
          )}
        </div>
      </LocalizedClientLink>

      {/* Actions footer — outside the link (valid HTML: no interactive elements inside <a>) */}
      <div className={`flex items-center gap-8 pb-10 small:pb-12 ${footerPadding}`}>
        {cheapestPrice && (
          <div className="font-grotesk font-semibold text-xl text-on-surface">
            <PreviewPrice price={cheapestPrice} />
          </div>
        )}
        <CardActions
          product={product}
          price={cheapestPrice?.calculated_price}
          colorVariant="tertiary"
        />
      </div>
    </div>
  )
}
