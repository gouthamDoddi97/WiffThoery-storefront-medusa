"use client"

import { getProductPrice } from "@lib/util/get-product-price"
import { getTierLabel } from "@modules/store/lib/store-filters"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PriceText from "@modules/common/components/price-text"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"
import CardActions from "./card-actions"

function formatTags(product: HttpTypes.StoreProduct): string {
  return (product.tags ?? [])
    .map((tag) => tag.value?.trim())
    .filter(Boolean)
    .join(" · ")
    .toUpperCase()
}

const tagTextClass =
  "font-mono text-[8px] small:text-[9px] tracking-[0.12em] uppercase text-on-surface-muted text-left leading-[1.35]"

const tagRuleStyle = (hairline: string) => ({
  borderColor: hairline,
  borderWidth: "var(--hairline-width)",
})

function MobileMetaRule({ hairline }: { hairline: string }) {
  return (
    <div
      className="w-full border-t shrink-0"
      style={tagRuleStyle(hairline)}
      aria-hidden
    />
  )
}

export default function ProductPreviewCard({
  product,
  showCollectionTier = false,
  onWishlistChange,
}: {
  product: HttpTypes.StoreProduct
  showCollectionTier?: boolean
  onWishlistChange?: (productId: string, wishlisted: boolean) => void
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const tagLine = formatTags(product)
  const hairline = "color-mix(in srgb, var(--on-surface) 28%, transparent)"

  const collectionName = product.collection?.title?.trim() ?? ""
  const tierLabel = getTierLabel(product) ?? ""
  const collectionTierLine = [collectionName, tierLabel]
    .filter(Boolean)
    .join(" · ")
  const mobileCollectionLine = collectionName.toUpperCase()

  return (
    <div className="group h-full" data-testid="product-wrapper">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex flex-row xsmall:flex-col bg-transparent transition-shadow duration-300 hover:shadow-card h-full"
        style={{ border: `var(--hairline-width) solid ${hairline}` }}
      >
        <div
          className="relative flex-shrink-0 overflow-hidden bg-surface-container aspect-[5/3] w-[52%] border-0 xsmall:w-[95%] xsmall:mx-auto xsmall:mt-[2.5%] xsmall:mb-[2.5%] xsmall:border xsmall:[border-width:var(--hairline-width)] small:w-full small:mx-0 small:mt-0 small:mb-0 small:border-0"
          style={{ borderColor: hairline, borderStyle: "solid" }}
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 512px) 52vw, 48vw"
              quality={75}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlaceholderImage size={48} />
            </div>
          )}
        </div>

        <div
          className="flex flex-row flex-1 min-w-0 items-start border-l xsmall:items-stretch xsmall:border-l-0 xsmall:border-t"
          style={{ borderColor: hairline }}
        >
          <div className="flex-1 flex flex-col justify-start gap-1 py-2 pl-2.5 pr-1.5 pb-1.5 xsmall:gap-2 xsmall:px-3 xsmall:py-2.5 small:px-4 small:py-3.5 min-w-0 text-left">
            <h3
              className="font-garamond serif-display font-medium uppercase text-on-surface tracking-[0.14em] leading-tight text-left line-clamp-2 xsmall:line-clamp-2 small:line-clamp-1"
              style={{ fontSize: "clamp(0.85rem, 3.2vw, 1.25rem)", fontStyle: "normal" }}
              data-testid="product-title"
            >
              {product.title}
            </h3>

            {/* Mobile — name rule, collection row, tag row, price */}
            <div className="xsmall:hidden flex flex-col gap-1 w-full">
              <MobileMetaRule hairline={hairline} />

              {mobileCollectionLine && (
                <p className={`${tagTextClass} line-clamp-1`}>
                  {mobileCollectionLine}
                </p>
              )}

              {mobileCollectionLine && tagLine && <MobileMetaRule hairline={hairline} />}

              {tagLine && (
                <p className={`${tagTextClass} line-clamp-2`}>{tagLine}</p>
              )}
            </div>

            {showCollectionTier && collectionTierLine && (
              <p className="hidden xsmall:block font-mono text-[8px] small:text-[9px] tracking-[0.12em] uppercase text-on-surface-muted line-clamp-2">
                {collectionTierLine}
              </p>
            )}

            {tagLine && (
              <div className="hidden xsmall:flex flex-col xsmall:flex-none">
                <div
                  className="w-[30%] border-t mb-2"
                  style={tagRuleStyle(hairline)}
                  aria-hidden
                />
                <p className={`${tagTextClass} line-clamp-2`}>{tagLine}</p>
              </div>
            )}

            {cheapestPrice && (
              <p
                className="xsmall:hidden font-mono font-medium text-sm text-on-surface text-left leading-none mt-1"
                data-testid="price"
              >
                <PriceText>{cheapestPrice.calculated_price}</PriceText>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end justify-end py-2 pr-2 pl-1 pb-1.5 xsmall:justify-between xsmall:py-2.5 xsmall:pb-2.5 xsmall:pr-3 xsmall:pl-2 small:px-3 gap-2">
            {cheapestPrice && (
              <p
                className="hidden xsmall:block font-mono font-medium text-sm small:text-base text-on-surface text-right leading-none whitespace-nowrap"
                data-testid="price"
              >
                <PriceText>{cheapestPrice.calculated_price}</PriceText>
              </p>
            )}
            <CardActions
              product={product}
              price={cheapestPrice?.calculated_price}
              colorVariant="default"
              storeFooter
              onWishlistChange={onWishlistChange}
            />
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
