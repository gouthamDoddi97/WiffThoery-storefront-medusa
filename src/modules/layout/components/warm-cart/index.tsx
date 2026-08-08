"use client"

import { ensureCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import { useEffect, useRef } from "react"

/** Creates the cart cookie on first visit so add-to-cart is one API call, not two. */
export default function WarmCart() {
  const { countryCode } = useParams() as { countryCode: string }
  const warmed = useRef(false)

  useEffect(() => {
    if (!countryCode || warmed.current) return
    warmed.current = true
    void ensureCart(countryCode)
  }, [countryCode])

  return null
}
