"use client"

import { resetCart } from "@lib/data/cart"
import { emitCartOptimisticReset, emitCartUpdated } from "@lib/cart/cart-events"
import { useParams, useRouter } from "next/navigation"
import { startTransition, useState } from "react"

export default function ResetCartButton({
  className = "btn-ghost text-xs py-2 px-6",
  label = "Clear cart & start fresh",
}: {
  className?: string
  label?: string
}) {
  const { countryCode } = useParams() as { countryCode: string }
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!countryCode || loading) return

    setLoading(true)
    emitCartOptimisticReset()
    emitCartUpdated(0)

    try {
      await resetCart(countryCode)
      startTransition(() => router.refresh())
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => void handleReset()}
      disabled={loading}
    >
      {loading ? "Clearing…" : label}
    </button>
  )
}
