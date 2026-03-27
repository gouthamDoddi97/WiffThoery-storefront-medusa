"use client"

import { useCallback, useEffect, useState } from "react"

const WISHLIST_KEY = "whiff_theory_wishlist"

export type WishlistItem = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  price: string
  collectionTitle?: string
}

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function useWishlist(productId?: string) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(readStorage())
    setMounted(true)
  }, [])

  const isWishlisted = mounted && !!productId && items.some((i) => i.id === productId)

  const toggle = useCallback(
    (item: WishlistItem) => {
      const current = readStorage()
      const exists = current.some((i) => i.id === item.id)
      const updated = exists
        ? current.filter((i) => i.id !== item.id)
        : [...current, item]
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated))
      setItems(updated)
    },
    []
  )

  return { items, isWishlisted, toggle, mounted }
}
