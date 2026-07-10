import { getProductPrice } from "@lib/util/get-product-price"
import { getTierLabel } from "@modules/store/lib/store-filters"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PriceText from "@modules/common/components/price-text"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"
import CardActions from "./card-actions"

type ProductPreviewProps = {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  /** `home` = horizontal row on mobile (fableRedesign); `store` = vertical card */
  layout?: "home" | "store"
  /** Inside collection plate frame — no per-card outer border */
  embeddedInPlate?: boolean
}

function formatTags(product: HttpTypes.StoreProduct): string {
  return (product.tags ?? [])
    .map((tag) => tag.value?.trim())
    .filter(Boolean)
    .join(" · ")
    .toUpperCase()
}

export default async function ProductPreview({
  product,
  region,
  layout = "store",
  embeddedInPlate = false,
}: ProductPreviewProps) {
  const { cheapestPrice } = getProductPrice({ product })

  const tagLine = formatTags(product)
  const hairline = "color-mix(in srgb, var(--on-surface) 28%, transparent)"

  if (layout === "home") {
    return (
      <div className="group h-full" data-testid="product-wrapper">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex flex-row bg-transparent transition-shadow duration-300 hover:shadow-card small:flex-col h-full"
          style={{ border: `var(--hairline-width) solid ${hairline}` }}
        >
          {/* Artwork — slightly shorter aspect to reduce card height */}
          <div className="relative w-[42%] small:w-full flex-shrink-0 aspect-[5/3] small:aspect-[2/1] bg-surface-container overflow-hidden">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 42vw, 33vw"
                quality={75}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <PlaceholderImage size={48} />
              </div>
            )}
          </div>

          {/* Details — name/tags 70% + price 30% on same row (all breakpoints) */}
          <div
            className="relative flex-1 flex flex-row items-start min-w-0 w-full bg-transparent border-l small:border-l-0 small:border-t"
            style={{ borderColor: hairline }}
          >
            <div className="w-[70%] order-1 flex flex-col justify-start gap-2 py-3 pl-3 pr-2 small:px-4 small:py-3.5 min-w-0">
              <h3
                className="font-garamond serif-display font-medium uppercase text-on-surface tracking-[0.14em] leading-tight line-clamp-2 small:line-clamp-1"
                style={{ fontSize: "clamp(0.85rem, 3.2vw, 1.25rem)", fontStyle: "normal" }}
                data-testid="product-title"
              >
                {product.title}
              </h3>

              {tagLine && (
                <div className="min-w-0">
                  <div
                    className="w-[30%] border-t mb-2"
                    style={{ borderColor: hairline, borderWidth: "var(--hairline-width)" }}
                  />
                  <p className="font-mono text-[8px] small:text-[9px] tracking-[0.12em] uppercase text-on-surface-muted line-clamp-2">
                    {tagLine}
                  </p>
                </div>
              )}
            </div>

            {cheapestPrice && (
              <div className="w-[30%] order-2 flex items-start justify-end py-3 pr-3 small:px-4 small:py-3.5">
                <p
                  className="font-mono font-medium text-sm small:text-base text-on-surface text-right leading-none whitespace-nowrap"
                  data-testid="price"
                >
                  <PriceText>{cheapestPrice.calculated_price}</PriceText>
                </p>
              </div>
            )}
          </div>
        </LocalizedClientLink>
      </div>
    )
  }

  /* Store layout — shop grid card (fableRedesign 11) */
  const artStyle =
    (product.metadata?.art_style as string) ||
    product.collection?.title?.toUpperCase() ||
    ""
  const tierLabel = getTierLabel(product)
  const metaLine = [artStyle, tierLabel].filter(Boolean).join(" · ")

  return (
    <div className="group flex flex-col h-full" data-testid="product-wrapper">
      <div
        className="flex flex-col h-full bg-surface-lowest"
        style={{ border: `var(--hairline-width) solid ${hairline}` }}
      >
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="p-3 pb-2">
            <div className="relative overflow-hidden aspect-[4/3] bg-surface-container">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 512px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={75}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderImage size={64} />
                </div>
              )}
            </div>
          </div>

          <div
            className="px-3 py-2 flex flex-col gap-1 text-center"
            style={{ borderTop: `var(--hairline-width) solid ${hairline}` }}
          >
            <h3
              className="font-garamond serif-display font-medium uppercase text-on-surface tracking-[0.14em] leading-tight line-clamp-2"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.2rem)", fontStyle: "normal" }}
              data-testid="product-title"
            >
              {product.title}
            </h3>

            {metaLine && (
              <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted line-clamp-1">
                {metaLine}
              </p>
            )}

            {tagLine && (
              <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-variant line-clamp-2">
                {tagLine}
              </p>
            )}
          </div>
        </LocalizedClientLink>

        <div
          className="flex items-stretch mt-auto"
          style={{ borderTop: `var(--hairline-width) solid ${hairline}` }}
        >
          <div className="flex-1 flex items-center justify-center py-2 px-3">
            {cheapestPrice && (
              <span
                className="font-mono font-medium text-sm text-on-surface whitespace-nowrap"
                data-testid="price"
              >
                <PriceText>{cheapestPrice.calculated_price}</PriceText>
              </span>
            )}
          </div>
          <div
            className="flex items-center justify-center"
            style={{ borderLeft: `var(--hairline-width) solid ${hairline}` }}
          >
            <CardActions
              product={product}
              price={cheapestPrice?.calculated_price}
              colorVariant="default"
              storeFooter
            />
          </div>
        </div>
      </div>
    </div>
  )
}
