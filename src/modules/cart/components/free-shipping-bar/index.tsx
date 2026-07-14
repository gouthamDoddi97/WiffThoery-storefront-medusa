"use client"

import PriceText from "@modules/common/components/price-text"
import { convertToLocale } from "@lib/util/money"
import {
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingProgress,
} from "@modules/cart/lib/cart-display"

export default function CartFreeShippingBar({
  itemSubtotal,
  currencyCode,
}: {
  itemSubtotal?: number | null
  currencyCode: string
}) {
  const { progress, unlocked } = getFreeShippingProgress(itemSubtotal)
  const thresholdLabel = convertToLocale({
    amount: FREE_SHIPPING_THRESHOLD,
    currency_code: currencyCode,
  })

  return (
    <div className="pt-8 mt-2 border-t rule-ink">
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface-muted">
          <PriceText>FREE SHIPPING OVER {thresholdLabel}</PriceText>
        </p> */}
        {/* <span className="font-mono text-[10px] tracking-[0.12em] text-on-surface-muted">
          {unlocked ? "100%" : `${progress}%`}
        </span> */}
      </div>
      <div
        className="h-1.5 w-full bg-surface-variant/25 overflow-hidden"
        style={{ border: "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 18%, transparent)" }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Free shipping progress"
      >
        <div
          className="h-full bg-on-surface transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
