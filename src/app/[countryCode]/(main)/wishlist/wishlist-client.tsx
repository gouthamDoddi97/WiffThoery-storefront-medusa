"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type WishlistItem = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  price: string
  collectionTitle?: string
}

const WISHLIST_KEY = "whiff_theory_wishlist"

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]")
  } catch {
    return []
  }
}

function removeFromWishlist(id: string): WishlistItem[] {
  const current = loadWishlist()
  const updated = current.filter((item) => item.id !== id)
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
  return updated
}

export default function WishlistClient() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(loadWishlist())
    setMounted(true)
  }, [])

  const handleRemove = (id: string) => {
    setItems(removeFromWishlist(id))
  }

  if (!mounted) {
    return (
      <div className="content-container py-24 min-h-screen bg-surface-lowest">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-32 bg-surface-variant/30" />
          <div className="h-10 w-64 bg-surface-variant/30" />
          <div className="grid grid-cols-2 small:grid-cols-4 gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-surface-variant/30" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-lowest min-h-screen py-16">
      <div className="content-container">
        {/* Header */}
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
          /* Empty state */
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
              <LocalizedClientLink href="/categories/crowd-pleaser">
                <button className="btn-primary">EXPLORE CROWD PLEASERS</button>
              </LocalizedClientLink>
              <LocalizedClientLink href="/store">
                <button className="btn-ghost">BROWSE ALL</button>
              </LocalizedClientLink>
            </div>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-px bg-surface-variant/20">
              {items.map((item) => (
                <div key={item.id} className="bg-surface-lowest group relative">
                  {/* Image */}
                  <LocalizedClientLink href={`/products/${item.handle}`}>
                    <div className="aspect-[3/4] bg-surface-container overflow-hidden">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={400}
                          height={533}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-grotesk font-bold text-3xl text-on-surface-disabled">W</span>
                        </div>
                      )}
                    </div>
                  </LocalizedClientLink>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-surface-container/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-1">
                    {item.collectionTitle && (
                      <span className="font-grotesk text-[9px] tracking-[0.2em] text-primary">
                        {item.collectionTitle.toUpperCase()}
                      </span>
                    )}
                    <LocalizedClientLink href={`/products/${item.handle}`}>
                      <span className="font-grotesk font-semibold text-sm text-on-surface hover:text-primary transition-colors block">
                        {item.title}
                      </span>
                    </LocalizedClientLink>
                    <span className="font-inter text-xs text-primary">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear all */}
            <div className="mt-12 flex justify-end">
              <button
                onClick={() => {
                  localStorage.removeItem(WISHLIST_KEY)
                  setItems([])
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
