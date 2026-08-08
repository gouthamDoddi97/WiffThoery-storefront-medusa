"use client"

import {
  CART_LINE_QUANTITY,
  CART_LINE_REMOVING,
  CART_OPTIMISTIC_RESET,
  CART_UPDATED,
} from "@lib/cart/cart-events"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"

function cartItemsSignature(items: HttpTypes.StoreCartLineItem[] | undefined) {
  return (
    items
      ?.map((item) => `${item.id}:${item.quantity}`)
      .sort()
      .join("|") ?? ""
  )
}

export function useOptimisticCartItems(cart?: HttpTypes.StoreCart | null) {
  const serverItems = cart?.items ?? []
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())
  const [quantityOverrides, setQuantityOverrides] = useState<
    Map<string, number>
  >(() => new Map())

  const serverSignature = cartItemsSignature(serverItems)

  useEffect(() => {
    setHiddenIds(new Set())
    setQuantityOverrides(new Map())
  }, [serverSignature])

  useEffect(() => {
    const reset = () => {
      setHiddenIds(new Set())
      setQuantityOverrides(new Map())
    }

    const onRemove = (event: Event) => {
      const { lineId } = (event as CustomEvent<{ lineId: string }>).detail
      setHiddenIds((current) => new Set(current).add(lineId))
      setQuantityOverrides((current) => {
        const next = new Map(current)
        next.delete(lineId)
        return next
      })
    }

    const onQuantity = (event: Event) => {
      const { lineId, quantity } = (
        event as CustomEvent<{ lineId: string; quantity: number }>
      ).detail

      if (quantity < 1) {
        onRemove(
          new CustomEvent(CART_LINE_REMOVING, { detail: { lineId } })
        )
        return
      }

      setQuantityOverrides((current) => new Map(current).set(lineId, quantity))
    }

    window.addEventListener(CART_LINE_REMOVING, onRemove)
    window.addEventListener(CART_LINE_QUANTITY, onQuantity)
    window.addEventListener(CART_UPDATED, reset)
    window.addEventListener(CART_OPTIMISTIC_RESET, reset)

    return () => {
      window.removeEventListener(CART_LINE_REMOVING, onRemove)
      window.removeEventListener(CART_LINE_QUANTITY, onQuantity)
      window.removeEventListener(CART_UPDATED, reset)
      window.removeEventListener(CART_OPTIMISTIC_RESET, reset)
    }
  }, [])

  const items = useMemo(() => {
    return serverItems
      .filter((item) => !hiddenIds.has(item.id))
      .map((item) => {
        const quantity = quantityOverrides.get(item.id)
        return quantity !== undefined ? { ...item, quantity } : item
      })
  }, [serverItems, hiddenIds, quantityOverrides])

  return items
}
