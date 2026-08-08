"use client"

import { transferCart } from "@lib/data/customer"
import { ExclamationCircleSolid } from "@medusajs/icons"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { startTransition, useCallback, useEffect, useRef, useState } from "react"

function CartMismatchBanner(props: {
  customer: StoreCustomer
  cart: StoreCart
}) {
  const { customer, cart } = props
  const router = useRouter()
  const autoAttempted = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [actionText, setActionText] = useState("Link cart")

  const shouldShow = Boolean(customer && !cart.customer_id && !dismissed)

  const runTransfer = useCallback(async () => {
    setIsPending(true)
    setActionText("Linking…")

    try {
      await transferCart()
      setDismissed(true)
      startTransition(() => router.refresh())
    } catch {
      setActionText("Try again")
    } finally {
      setIsPending(false)
    }
  }, [router])

  useEffect(() => {
    if (!shouldShow || autoAttempted.current) return
    autoAttempted.current = true
    void runTransfer()
  }, [shouldShow, runTransfer])

  if (!shouldShow) {
    return null
  }

  return (
    <div className="flex items-center justify-center small:p-4 p-2 text-center bg-orange-300 small:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <ExclamationCircleSolid className="inline" />
          Link this cart to your account to save your checkout progress
        </span>

        <span>·</span>

        <Button
          variant="transparent"
          className="hover:bg-transparent active:bg-transparent focus:bg-transparent disabled:text-orange-500 text-orange-950 p-0 bg-transparent"
          size="base"
          disabled={isPending}
          onClick={() => void runTransfer()}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner
