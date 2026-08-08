"use client"

import {
  emitCartLineQuantity,
  emitCartLineRemoving,
  emitCartOptimisticDelta,
  emitCartOptimisticReset,
  emitCartUpdated,
} from "@lib/cart/cart-events"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { useRouter } from "next/navigation"
import { startTransition, useCallback, useRef, useState } from "react"

export function useCartLineMutations() {
  const router = useRouter()
  const [isMutating, setIsMutating] = useState(false)
  const inFlight = useRef(false)

  const removeLine = useCallback(
    async (lineId: string, quantity: number): Promise<boolean> => {
      if (!lineId || inFlight.current) return false

      inFlight.current = true
      setIsMutating(true)
      emitCartOptimisticDelta(-quantity)
      emitCartLineRemoving(lineId)

      try {
        const { totalItems } = await deleteLineItem(lineId)
        emitCartUpdated(totalItems)
        startTransition(() => router.refresh())
        return true
      } catch {
        emitCartOptimisticReset()
        emitCartOptimisticDelta(quantity)
        return false
      } finally {
        inFlight.current = false
        setIsMutating(false)
      }
    },
    [router]
  )

  const setLineQuantity = useCallback(
    async (
      lineId: string,
      quantity: number,
      previousQuantity: number
    ): Promise<boolean> => {
      if (!lineId || inFlight.current) return false

      inFlight.current = true
      setIsMutating(true)

      const delta = quantity - previousQuantity
      if (delta) {
        emitCartOptimisticDelta(delta)
      }
      emitCartLineQuantity(lineId, quantity)

      try {
        if (quantity < 1) {
          const { totalItems } = await deleteLineItem(lineId)
          emitCartUpdated(totalItems)
        } else {
          const { totalItems } = await updateLineItem({ lineId, quantity })
          emitCartUpdated(totalItems)
        }
        startTransition(() => router.refresh())
        return true
      } catch {
        emitCartOptimisticReset()
        if (delta) {
          emitCartOptimisticDelta(-delta)
        }
        emitCartLineQuantity(lineId, previousQuantity)
        return false
      } finally {
        inFlight.current = false
        setIsMutating(false)
      }
    },
    [router]
  )

  return { removeLine, setLineQuantity, isMutating }
}
