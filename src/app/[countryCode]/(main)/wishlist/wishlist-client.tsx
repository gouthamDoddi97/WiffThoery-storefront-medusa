"use client"

import { addProductsToCart, BulkAddResult } from "@lib/data/cart"
import { getProductsByIds } from "@lib/data/products"
import { WISHLIST_KEY, WishlistItem } from "@lib/hooks/use-wishlist"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreviewCard from "@modules/products/components/product-preview/product-preview-card"
import { HttpTypes } from "@medusajs/types"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]")
  } catch {
    return []
  }
}

function formatBulkResult(result: BulkAddResult): string {
  const parts: string[] = []
  if (result.added.length) {
    parts.push(
      `Added ${result.added.length} ${result.added.length === 1 ? "item" : "items"} to cart`
    )
    if (result.usedDefaultVariant.length) {
      parts.push("default size used — adjust in your cart if needed")
    }
  }
  const unavailable = result.skipped.filter((s) => s.reason === "unavailable")
  if (unavailable.length) {
    parts.push(
      `${unavailable.length} ${unavailable.length === 1 ? "was" : "were"} unavailable`
    )
  }
  return parts.join(". ") + (parts.length ? "." : "")
}

function SelectionCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onChange()
      }}
      className={`w-7 h-7 flex items-center justify-center border bg-surface-container/90 backdrop-blur-sm transition-colors ${checked ? "border-primary text-primary" : "border-surface-variant text-on-surface-disabled hover:border-primary"} ${className}`}
      style={{ borderWidth: "var(--hairline-width)" }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  )
}

function WishlistCardSkeleton() {
  const hairline = "color-mix(in srgb, var(--on-surface) 28%, transparent)"
  return (
    <div className="animate-pulse h-full" style={{ border: `var(--hairline-width) solid ${hairline}` }}>
      <div className="flex flex-row xsmall:flex-col h-full">
        <div className="relative flex-shrink-0 bg-surface-variant/30 aspect-[5/3] w-[42%] xsmall:w-[95%] xsmall:mx-auto xsmall:mt-[2.5%] xsmall:mb-[2.5%] small:w-full small:mx-0 small:mt-0 small:mb-0" />
        <div className="flex flex-1 min-w-0 border-l xsmall:border-l-0 xsmall:border-t" style={{ borderColor: hairline }}>
          <div className="w-[70%] p-3 space-y-2">
            <div className="h-4 bg-surface-variant/30 w-4/5" />
            <div className="h-3 bg-surface-variant/20 w-2/5" />
          </div>
          <div className="w-[30%] p-3 flex flex-col items-end justify-between">
            <div className="h-4 bg-surface-variant/30 w-12" />
            <div className="h-7 w-7 bg-surface-variant/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WishlistClient() {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [mounted, setMounted] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const syncProducts = useCallback(
    async (wishlistItems: WishlistItem[]) => {
      if (!wishlistItems.length) {
        setProducts([])
        return
      }

      setLoadingProducts(true)
      try {
        const fetched = await getProductsByIds({
          productIds: wishlistItems.map((item) => item.id),
          countryCode,
        })
        setProducts(fetched)
      } catch {
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    },
    [countryCode]
  )

  useEffect(() => {
    const loaded = loadWishlist()
    setItems(loaded)
    setSelectedIds(new Set(loaded.map((item) => item.id)))
    setMounted(true)
    void syncProducts(loaded)
  }, [syncProducts])

  const allSelected = products.length > 0 && selectedIds.size === products.length

  const selectedCountLabel = useMemo(() => {
    if (!selectedIds.size) return "NONE SELECTED"
    if (allSelected) return `ALL ${products.length} SELECTED`
    return `${selectedIds.size} SELECTED`
  }, [allSelected, products.length, selectedIds.size])

  const handleWishlistChange = (productId: string, wishlisted: boolean) => {
    if (wishlisted) return

    const updatedItems = loadWishlist()
    setItems(updatedItems)
    setProducts((prev) => prev.filter((product) => product.id !== productId))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(products.map((product) => product.id!)))
    }
  }

  const handleBulkAdd = async (productIds: string[]) => {
    if (!productIds.length || adding) return

    setAdding(true)
    setStatus(null)
    try {
      const result = await addProductsToCart({ productIds, countryCode })
      const message = formatBulkResult(result)
      setStatus(message || "Nothing was added to cart.")
      router.refresh()
    } catch {
      setStatus("Could not add items to cart. Please try again.")
    } finally {
      setAdding(false)
    }
  }

  if (!mounted) {
    return (
      <div className="content-container py-24 min-h-screen bg-surface-lowest">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-32 bg-surface-variant/30" />
          <div className="h-10 w-64 bg-surface-variant/30" />
          <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 small:gap-8 mt-8">
            {[...Array(3)].map((_, i) => (
              <li key={i}>
                <WishlistCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-lowest min-h-screen py-16">
      <div className="content-container">
        <div className="flex flex-col gap-2 mb-12">
          <span className="eyebrow">YOUR RADAR</span>
          <h1 className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface tracking-[-0.02em]">
            ON YOUR RADAR
          </h1>
          {items.length > 0 && (
            <p className="font-inter text-sm text-on-surface-variant">
              {items.length} {items.length === 1 ? "FRAGMENT" : "FRAGMENTS"} IN YOUR SIGHTS
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-24 flex flex-col gap-6 items-start max-w-[480px]">
            <div className="w-1 h-12 bg-primary" />
            <h2 className="font-grotesk font-bold text-2xl text-on-surface">
              Nothing on the radar yet.
            </h2>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
              When you find a fragrance you&apos;re considering, save it here. Use the heart icon on
              any product page to add it to your radar.
            </p>
            <div className="flex gap-4 mt-2">
              <LocalizedClientLink href="/categories/popular">
                <button className="btn-primary">EXPLORE POPULAR</button>
              </LocalizedClientLink>
              <LocalizedClientLink href="/store">
                <button className="btn-ghost">BROWSE ALL</button>
              </LocalizedClientLink>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 small:flex-row small:items-center small:justify-between">
              <div className="flex items-center gap-3">
                <SelectionCheckbox
                  checked={allSelected}
                  onChange={toggleAll}
                  label={allSelected ? "Deselect all" : "Select all"}
                  className="bg-surface-lowest"
                />
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-grotesk text-[10px] tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors"
                >
                  {allSelected ? "DESELECT ALL" : "SELECT ALL"}
                </button>
                <span className="font-mono text-[9px] tracking-[0.12em] text-on-surface-disabled uppercase">
                  {selectedCountLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleBulkAdd([...selectedIds])}
                  disabled={adding || selectedIds.size === 0}
                  className="btn-ghost px-5 py-3 text-[10px] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {adding ? "ADDING…" : `ADD SELECTED${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAdd(products.map((product) => product.id!))}
                  disabled={adding || !products.length}
                  className="btn-primary px-5 py-3 text-[10px] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {adding ? "ADDING…" : `ADD ALL (${products.length})`}
                </button>
              </div>
            </div>

            {status && (
              <p className="mb-6 font-inter text-sm text-on-surface-variant" role="status">
                {status}
              </p>
            )}

            <ul className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 gap-6 small:gap-8 items-stretch">
              {loadingProducts
                ? items.map((item) => (
                    <li key={item.id} className="min-w-0 h-full">
                      <WishlistCardSkeleton />
                    </li>
                  ))
                : products.map((product) => {
                    const isSelected = selectedIds.has(product.id!)
                    return (
                      <li key={product.id} className="relative min-w-0 h-full">
                        <SelectionCheckbox
                          checked={isSelected}
                          onChange={() => toggleItem(product.id!)}
                          label={`${isSelected ? "Deselect" : "Select"} ${product.title}`}
                          className="absolute top-2 left-2 z-10"
                        />
                        <ProductPreviewCard
                          product={product}
                          showCollectionTier
                          onWishlistChange={handleWishlistChange}
                        />
                      </li>
                    )
                  })}
            </ul>

            {!loadingProducts && products.length < items.length && (
              <p className="mt-6 font-inter text-sm text-on-surface-variant">
                {items.length - products.length}{" "}
                {items.length - products.length === 1 ? "item is" : "items are"} no longer available.
              </p>
            )}

            <div className="mt-12 flex justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem(WISHLIST_KEY)
                  setItems([])
                  setProducts([])
                  setSelectedIds(new Set())
                }}
                className="font-grotesk text-[10px] tracking-[0.15em] text-on-surface-disabled hover:text-secondary transition-colors"
              >
                CLEAR RADAR
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
