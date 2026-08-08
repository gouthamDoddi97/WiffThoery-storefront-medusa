"use client"

import { useState } from "react"
import { useAddToCart } from "@lib/hooks/use-add-to-cart"
import { SetItem } from "@lib/data/offers"

export default function AddSetToCartButton({
  items,
  className,
}: {
  items: SetItem[]
  className?: string
}) {
  const { addMany, isAdding, warmCart } = useAddToCart()
  const [state, setState] = useState<"idle" | "added" | "error">("idle")

  const handleClick = async () => {
    if (isAdding) return
    const ok = await addMany(
      items.map((item) => ({ variantId: item.variant_id, quantity: 1 }))
    )
    if (ok) {
      setState("added")
      setTimeout(() => setState("idle"), 2000)
    } else {
      setState("error")
      setTimeout(() => setState("idle"), 2000)
    }
  }

  const label =
    isAdding
      ? "Adding…"
      : state === "added"
      ? "Added to Cart"
      : state === "error"
      ? "Try Again"
      : "Add to Cart"

  return (
    <button
      onClick={handleClick}
      onMouseEnter={warmCart}
      disabled={isAdding}
      className={
        className ??
        "w-full flex items-center justify-center py-3 px-6 bg-tertiary text-surface-lowest font-inter text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-tertiary/90 disabled:opacity-60 transition-colors duration-200"
      }
    >
      {label}
    </button>
  )
}
