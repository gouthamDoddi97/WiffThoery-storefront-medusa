"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CardActions from "./card-actions"
import { VariantPrice } from "types/global"

function InlinePrice({ price }: { price: VariantPrice }) {
  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && (
        <span className="font-inter text-xs text-on-surface-disabled line-through">
          {price.original_price}
        </span>
      )}
      <span
        className={
          price.price_type === "sale"
            ? "font-grotesk font-semibold text-sm text-secondary"
            : "font-grotesk font-semibold text-sm text-primary"
        }
      >
        <span className="font-inter font-normal text-[10px] tracking-[0.1em] uppercase text-on-surface-disabled mr-1">From</span>
        {price.calculated_price}
      </span>
    </div>
  )
}

export default function ProductRevealCard({
  product,
  cheapestPrice,
  compact = false,
}: {
  product: HttpTypes.StoreProduct
  cheapestPrice: VariantPrice | undefined | null
  compact?: boolean
}) {
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  return (
    <div className="group block" data-testid="product-wrapper">

      {/* Image — static, no hover effect */}
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div
          className={`overflow-hidden w-full ${
            compact ? "aspect-square max-h-[380px]" : "aspect-[3/5]"
          }`}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
        </div>

        {/* Info */}
        <div className="pt-4 flex flex-col gap-2.5">
          {product.collection && (
            <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-primary">
              {product.collection.title}
            </span>
          )}
          <h3
            className={`font-garamond italic font-normal text-on-surface leading-[0.95] ${
              compact ? "text-xl small:text-2xl" : "text-3xl small:text-4xl"
            }`}
            style={{ letterSpacing: "-0.01em" }}
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="font-inter text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 border text-on-surface-variant"
                  style={{ borderColor: "rgba(255,255,255,0.14)" }}
                >
                  {tag.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </LocalizedClientLink>

      {/* Actions + explore CTA */}
      <div className="mt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          {cheapestPrice && <InlinePrice price={cheapestPrice} />}
          <CardActions
            product={product}
            price={cheapestPrice?.calculated_price}
            colorVariant="primary"
          />
        </div>

        {/* Explore CTA — animates in on hover */}
        <div
          className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out"
        >
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            className="group/link flex items-center gap-2.5 font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-disabled hover:text-primary transition-colors duration-300"
          >
            <span
              className="block h-px bg-current transition-all duration-500 group-hover/link:w-6"
              style={{ width: "14px" }}
            />
            Explore in depth
            <svg
              width="11" height="11" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="transition-transform duration-300 group-hover/link:translate-x-0.5"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

    </div>
  )
}
