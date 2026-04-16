import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getPricesForVariant, getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CardActions from "./card-actions"
import PreviewPrice, { VariantPriceList } from "./price"

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

  const rawVariants = (product.variants ?? []).filter((v: any) => !!v.calculated_price)
  const isSingleVariant = rawVariants.length === 1

  const variantPrices = rawVariants
    .sort((a: any, b: any) => a.calculated_price.calculated_amount - b.calculated_price.calculated_amount)
    .flatMap((v: any) => {
      const price = getPricesForVariant(v)
      if (!price) return []
      const rawSize = v.options?.[0]?.value ?? v.title ?? ""
      const isDefault = !rawSize || /default/i.test(rawSize)
      const size = isDefault && isSingleVariant ? "50ml" : rawSize
      return [{ size, price }]
    })

  // Combine all note categories into a single dot-separated line (mobile)
  const allNotes = [details?.top_notes, details?.middle_notes, details?.base_notes]
    .filter(Boolean)
    .join(" · ")

  const noteColumns = [
    { label: "TOP", value: details?.top_notes },
    { label: "HEART", value: details?.middle_notes },
    { label: "BASE", value: details?.base_notes },
  ].filter((n) => n.value)

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
    <div className="flex-1 flex flex-col justify-start px-10 py-10 small:px-14 small:py-12 gap-5 pb-4 small:pb-4">
      {/* Series label */}
      <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-tertiary">
        {seriesLabel}
      </span>

      {/* Title */}
      <h3 className="font-grotesk font-bold text-4xl small:text-[3.2rem] text-on-surface tracking-[-0.03em] leading-[0.88] uppercase">
        {product.title}
      </h3>

      {/* Notes — single dot-separated line */}
      {allNotes && (
        <p className="font-inter text-[10px] tracking-[0.22em] uppercase text-on-surface-disabled">
          {allNotes}
        </p>
      )}

      {/* Character tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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

      {/* Description / scent story — desktop only (mobile version is full-width below) */}
      {description && (
        <p className="hidden small:block font-inter text-sm text-on-surface-variant leading-relaxed line-clamp-6">
          {description}
        </p>
      )}

      {/* Top / Heart / Base breakdown — desktop only, below description */}
      {noteColumns.length > 0 && (
        <div className="hidden small:flex border border-surface-variant mt-2">
          {noteColumns.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex-1 flex flex-col gap-2 px-5 py-4 ${i > 0 ? "border-l border-surface-variant" : ""}`}
            >
              <span className="font-inter text-[9px] tracking-[0.28em] uppercase text-on-surface-disabled">
                {label}
              </span>
              <span className="font-inter text-xs text-on-surface-variant leading-relaxed">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}


    </div>
  )

  // Footer aligns with the info column in both orientations.
  // The info column is always 64% wide (flex-1 against 36% image).
  // We replicate that structure: a 36% spacer (omitted when reversed) + info-width container.
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

      {/* Description — mobile only, full row width */}
      {description && (
        <p className="small:hidden font-inter text-sm text-on-surface-variant leading-relaxed line-clamp-4 px-4 pt-3 pb-1">
          {description}
        </p>
      )}

      {/* Actions footer — mirrors the info column position in both orientations */}
      <div className="flex pb-10 small:pb-12">
        {/* Spacer matches image width (36%) — only when image is on the left */}
        {!isReversed && <div className="w-[36%] flex-shrink-0" />}

        {/* Content aligns with info column, using same horizontal padding as infoBlock */}
        <div className="flex-1 flex items-center gap-8 px-10 small:px-14">
          {variantPrices.length > 0 ? (
            <VariantPriceList variantPrices={variantPrices} priceTextClass="text-base" />
          ) : cheapestPrice ? (
            <div className="font-grotesk font-semibold text-xl text-on-surface">
              <PreviewPrice price={cheapestPrice} />
            </div>
          ) : null}
          <CardActions
            product={product}
            price={cheapestPrice?.calculated_price}
            colorVariant="tertiary"
          />
        </div>

        {/* Spacer matches image width (36%) — only when image is on the right */}
        {isReversed && <div className="w-[36%] flex-shrink-0" />}
      </div>
    </div>
  )
}
