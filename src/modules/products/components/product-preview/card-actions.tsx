"use client"

import { addToCart } from "@lib/data/cart"
import { useWishlist } from "@lib/hooks/use-wishlist"
import { HttpTypes } from "@medusajs/types"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

export type CardColorVariant = "primary" | "tertiary" | "default"

const colorMap: Record<CardColorVariant, { btn: string; wish: string; wishActive: string }> = {
  primary: {
    btn: "border-primary text-primary hover:bg-primary hover:text-surface-lowest",
    wish: "text-on-surface-disabled hover:text-primary",
    wishActive: "text-primary",
  },
  tertiary: {
    btn: "border-tertiary text-tertiary hover:bg-tertiary hover:text-surface-lowest",
    wish: "text-on-surface-disabled hover:text-tertiary",
    wishActive: "text-tertiary",
  },
  default: {
    btn: "border-on-surface-variant text-on-surface-variant hover:bg-on-surface-variant hover:text-surface-lowest",
    wish: "text-on-surface-disabled hover:text-on-surface",
    wishActive: "text-on-surface",
  },
}

export default function CardActions({
  product,
  price,
  colorVariant = "default",
}: {
  product: HttpTypes.StoreProduct
  price?: string | null
  colorVariant?: CardColorVariant
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { isWishlisted, toggle, mounted } = useWishlist(product.id)

  const colors = colorMap[colorVariant]
  const variants = product.variants ?? []

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (variants.length !== 1) {
      // Multiple variants — navigate to product page for selection
      router.push(`/${countryCode}/products/${product.handle}`)
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        variantId: variants[0].id!,
        quantity: 1,
        countryCode,
      })
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {
      // silently fail — product page handles full error state
    } finally {
      setIsAdding(false)
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle({
      id: product.id!,
      handle: product.handle!,
      title: product.title!,
      thumbnail: product.thumbnail ?? null,
      price: price ?? "",
      collectionTitle: product.collection?.title,
    })
  }

  return (
    <div className="flex items-center gap-3">
      {/* Wishlist heart */}
      {mounted && (
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`p-1 transition-colors duration-200 flex-shrink-0 ${
            isWishlisted ? colors.wishActive : colors.wish
          }`}
        >
          {isWishlisted ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      )}

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`inline-flex items-center gap-2 border font-inter text-[9px] tracking-[0.2em] uppercase px-4 py-2.5 transition-all duration-300 whitespace-nowrap flex-shrink-0 disabled:opacity-50 cursor-pointer ${
          added
            ? "bg-primary border-primary text-surface-lowest"
            : colors.btn
        }`}
      >
        {isAdding ? "ADDING..." : added ? "ADDED ✓" : "ADD TO CART"}
        {!isAdding && !added && (
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        )}
      </button>
    </div>
  )
}
