import { getPerfumeDetails } from "@lib/data/perfume-details"
import { getPricesForVariant, getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"
import CardActions from "./card-actions"
import PreviewPrice, { VariantPriceList } from "./price"

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

  const allNotes = [details?.top_notes, details?.middle_notes, details?.base_notes]
    .filter(Boolean)
    .join(" · ")

  const caption = details?.caption || allNotes || ""

  return (
    <div className="group flex flex-col" data-testid="product-wrapper">

      {/* ── Image ── */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block relative overflow-hidden aspect-[3/4] bg-surface-container"
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={70}
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlaceholderImage size={64} />
          </div>
        )}

        {/* Bottom gradient + EXPLORE reveal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-white/90">EXPLORE</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="square" opacity="0.9">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        {/* Collection badge — top-left */}
        {product.collection?.title && (
          <div className="absolute top-3 left-3">
            <span className="font-inter text-[8px] tracking-[0.22em] uppercase text-primary bg-surface-lowest/75 px-2 py-0.5 backdrop-blur-sm">
              {product.collection.title}
            </span>
          </div>
        )}

        {/* Wishlist / cart actions — top-right, hover only */}
        <div className="absolute top-2 right-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <CardActions
            product={product}
            price={cheapestPrice?.calculated_price}
            colorVariant="default"
            overlay
          />
        </div>
      </LocalizedClientLink>

      {/* ── Info ── */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="flex flex-col gap-1 pt-3 pb-1"
      >
        {/* Tags — single truncated row */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex gap-2 overflow-hidden h-3.5">
            {product.tags.slice(0, 5).map((tag) => (
              <span
                key={tag.id}
                className="font-inter text-[8px] tracking-[0.18em] uppercase text-on-surface-disabled whitespace-nowrap"
              >
                {tag.value}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-garamond italic font-normal text-on-surface line-clamp-2 leading-[1.15] mt-0.5"
          style={{ fontSize: "clamp(1rem, 2.4vw, 1.15rem)" }}
          data-testid="product-title"
        >
          {product.title}
        </h3>

        {/* Note caption */}
        {caption && (
          <p className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled line-clamp-1 leading-relaxed">
            {caption}
          </p>
        )}

        {/* Price */}
        <div className="mt-1.5">
          {variantPrices.length > 0
            ? <VariantPriceList variantPrices={variantPrices} />
            : cheapestPrice && <PreviewPrice price={cheapestPrice} />
          }
        </div>
      </LocalizedClientLink>

    </div>
  )
}
