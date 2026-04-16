"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { addToCart } from "@lib/data/cart"
import { SetItem } from "@lib/data/offers"

export default function AddSetToCartButton({
  items,
  className,
}: {
  items: SetItem[]
  className?: string
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle")

  const handleClick = async () => {
    if (state === "adding") return
    setState("adding")
    try {
      await Promise.all(
        items.map((item) =>
          addToCart({ variantId: item.variant_id, quantity: 1, countryCode })
        )
      )
      setState("added")
      setTimeout(() => setState("idle"), 2000)
    } catch {
      setState("error")
      setTimeout(() => setState("idle"), 2000)
    }
  }

  const label =
    state === "adding"
      ? "Adding…"
      : state === "added"
      ? "Added to Cart"
      : state === "error"
      ? "Try Again"
      : "Add to Cart"

  return (
    <button
      onClick={handleClick}
      disabled={state === "adding"}
      className={
        className ??
        "w-full flex items-center justify-center py-3 px-6 bg-tertiary text-surface-lowest font-inter text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-tertiary/90 disabled:opacity-60 transition-colors duration-200"
      }
    >
      {label}
    </button>
  )
}
