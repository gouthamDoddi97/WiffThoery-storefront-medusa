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

  const caption = details?.caption || allNotes || ""

  return (
    <div className="group flex flex-col" data-testid="product-wrapper">
      {/* Image — fixed aspect ratio, icons overlaid */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] bg-surface-container transition-all duration-300 group-hover:opacity-90">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          {/* Action icons — absolute top-right */}
          <div className="absolute top-2 right-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CardActions
              product={product}
              price={cheapestPrice?.calculated_price}
              colorVariant="default"
              overlay
            />
          </div>
        </div>
      </LocalizedClientLink>

      {/* Character tags — 2-row centred on mobile, single-row left-aligned on desktop */}
      <div className="flex flex-wrap justify-center items-center content-center gap-1.5 px-4 py-2 min-h-[4.25rem] max-h-[4.25rem] small:flex-nowrap small:justify-start small:content-start small:h-9 small:min-h-0 small:max-h-none bg-surface-low border-t border-white/[0.04] overflow-hidden">
        {product.tags && product.tags.length > 0
          ? product.tags.slice(0, 6).map((tag) => (
              product.tags!.length <= 2
                ? <span key={tag.id} className="w-full flex justify-center small:w-auto small:justify-start">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm border border-white/10 font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled whitespace-nowrap">
                      {tag.value}
                    </span>
                  </span>
                : <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-sm border border-white/10 font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled whitespace-nowrap"
                  >
                    {tag.value}
                  </span>
            ))
          : null
        }
      </div>

      {/* Info row */}
      <div className="flex items-start p-4 bg-surface-low group-hover:bg-surface-container transition-colors duration-300 flex-1">
        {/* Text content — also a link */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex-1 min-w-0 flex flex-col gap-1.5"
        >
          {/* Collection badge */}
          <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary h-4 truncate">
            {product.collection?.title ?? ""}
          </span>

          {/* Title — always 2 lines reserved */}
          <h3
            className="font-grotesk font-semibold text-on-surface text-sm tracking-[-0.01em] leading-snug line-clamp-2 min-h-[2.5rem]"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Notes — always 2 lines reserved */}
          <p className="font-inter text-[10px] tracking-[0.18em] uppercase text-on-surface-disabled leading-relaxed line-clamp-2 min-h-[2rem]">
            {caption}
          </p>

          {/* Price */}
          <div className="mt-0.5">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
