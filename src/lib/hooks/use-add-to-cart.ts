"use client"

import { addToCart, addManyToCart, ensureCart } from "@lib/data/cart"
import {
  emitCartOptimisticDelta,
  emitCartUpdated,
} from "@lib/cart/cart-events"
import { useParams, useRouter } from "next/navigation"
import { startTransition, useCallback, useRef, useState } from "react"

type AddInput = {
  variantId: string
  quantity?: number
}

export function useAddToCart() {
  const router = useRouter()
  const { countryCode } = useParams() as { countryCode: string }
  const [isAdding, setIsAdding] = useState(false)
  const inFlight = useRef(false)

  const warmCart = useCallback(() => {
    if (!countryCode) return
    void ensureCart(countryCode)
  }, [countryCode])

  const add = useCallback(
    async ({ variantId, quantity = 1 }: AddInput): Promise<boolean> => {
      if (!variantId || !countryCode || inFlight.current) return false

      inFlight.current = true
      setIsAdding(true)
      emitCartOptimisticDelta(quantity)

      try {
        const { totalItems } = await addToCart({
          variantId,
          quantity,
          countryCode,
        })
        emitCartUpdated(totalItems)
        startTransition(() => router.refresh())
        return true
      } catch {
        emitCartOptimisticDelta(-quantity)
        return false
      } finally {
        inFlight.current = false
        setIsAdding(false)
      }
    },
    [countryCode, router]
  )

  const addMany = useCallback(
    async (
      items: Array<{ variantId: string; quantity?: number }>
    ): Promise<boolean> => {
      if (!items.length || !countryCode || inFlight.current) return false

      const totalQty = items.reduce(
        (sum, item) => sum + (item.quantity ?? 1),
        0
      )

      inFlight.current = true
      setIsAdding(true)
      emitCartOptimisticDelta(totalQty)

      try {
        const { totalItems } = await addManyToCart({ items, countryCode })
        emitCartUpdated(totalItems)
        startTransition(() => router.refresh())
        return true
      } catch {
        emitCartOptimisticDelta(-totalQty)
        return false
      } finally {
        inFlight.current = false
        setIsAdding(false)
      }
    },
    [countryCode, router]
  )

  return { add, addMany, isAdding, warmCart }
}
