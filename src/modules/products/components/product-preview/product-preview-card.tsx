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

  return (
    <div className="group h-full" data-testid="product-wrapper">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex flex-row xsmall:flex-col bg-transparent transition-shadow duration-300 hover:shadow-card h-full"
        style={{ border: `var(--hairline-width) solid ${hairline}` }}
      >
        <div
          className="relative flex-shrink-0 overflow-hidden bg-surface-container aspect-[5/3] w-[42%] border-0 xsmall:w-[95%] xsmall:mx-auto xsmall:mt-[2.5%] xsmall:mb-[2.5%] xsmall:border xsmall:[border-width:var(--hairline-width)] small:w-full small:mx-0 small:mt-0 small:mb-0 small:border-0"
          style={{ borderColor: hairline, borderStyle: "solid" }}
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 512px) 42vw, 48vw"
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
          className="flex flex-row flex-1 min-w-0 border-l xsmall:border-l-0 xsmall:border-t"
          style={{ borderColor: hairline }}
        >
          <div className="w-[70%] flex flex-col justify-start gap-2 py-3 pl-3 pr-2 xsmall:px-3 xsmall:py-2.5 small:px-4 small:py-3.5 min-w-0 text-left">
            <h3
              className="font-garamond serif-display font-medium uppercase text-on-surface tracking-[0.14em] leading-tight text-left line-clamp-2 xsmall:line-clamp-2 small:line-clamp-1"
              style={{ fontSize: "clamp(0.85rem, 3.2vw, 1.25rem)", fontStyle: "normal" }}
              data-testid="product-title"
            >
              {product.title}
            </h3>

            {showCollectionTier && collectionTierLine && (
              <p className="font-mono text-[8px] small:text-[9px] tracking-[0.12em] uppercase text-on-surface-muted line-clamp-2">
                {collectionTierLine}
              </p>
            )}

            {tagLine && (
              <div className="min-w-0">
                <div
                  className="w-[30%] border-t mb-2"
                  style={{ borderColor: hairline, borderWidth: "var(--hairline-width)" }}
                />
                <p className="font-mono text-[8px] small:text-[9px] tracking-[0.12em] uppercase text-on-surface-muted line-clamp-2 text-left">
                  {tagLine}
                </p>
              </div>
            )}
          </div>

          <div className="w-[30%] flex flex-col items-end justify-between py-3 pr-2 pl-2 xsmall:py-2.5 xsmall:pr-3 xsmall:pl-2 small:px-3 gap-2">
            {cheapestPrice && (
              <p
                className="font-mono font-medium text-sm small:text-base text-on-surface text-right leading-none whitespace-nowrap"
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
