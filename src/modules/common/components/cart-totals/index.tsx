"use client"

import { convertToLocale } from "@lib/util/money"
import PriceText from "@modules/common/components/price-text"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div>
      <div className="flex flex-col gap-y-2 font-inter text-sm text-on-surface-variant">
        <div className="flex items-center justify-between gap-4">
          <span>Subtotal (excl. shipping and taxes)</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            <PriceText>
              {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
            </PriceText>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Shipping</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
            <PriceText>
              {convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })}
            </PriceText>
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between gap-4">
            <span>Discount</span>
            <span
              className="text-primary-container font-medium"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              <PriceText>
                {convertToLocale({
                  amount: discount_subtotal ?? 0,
                  currency_code,
                })}
              </PriceText>
            </span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span>Taxes</span>
          <span data-testid="cart-taxes" data-value={tax_total || 0}>
            <PriceText>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </PriceText>
          </span>
        </div>
      </div>
      <div className="h-px w-full bg-surface-variant/40 my-4" />
      <div className="flex items-center justify-between gap-4 font-grotesk font-bold text-on-surface">
        <span className="text-sm tracking-[0.08em] uppercase">Total</span>
        <span
          className="text-xl tracking-[-0.02em]"
          data-testid="cart-total"
          data-value={total || 0}
        >
          <PriceText>
            {convertToLocale({ amount: total ?? 0, currency_code })}
          </PriceText>
        </span>
      </div>
      <div className="h-px w-full bg-surface-variant/40 mt-4" />
    </div>
  )
}

export default CartTotals
