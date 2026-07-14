"use client"

import { convertToLocale } from "@lib/util/money"
import {
  getCartPayableTotal,
  normalizeInrShippingAmount,
  shouldNormalizeInrShipping,
} from "@lib/util/medusa-amount"
import PriceText from "@modules/common/components/price-text"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    item_total?: number | null
    shipping_subtotal?: number | null
    shipping_total?: number | null
    discount_subtotal?: number | null
    shipping_methods?: Array<{ name?: string | null }> | null
  }
  variant?: "default" | "checkout"
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, variant = "default" }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    item_total,
    shipping_subtotal,
    shipping_total,
    discount_subtotal,
    shipping_methods,
  } = totals

  const displayItemTotal = item_total ?? item_subtotal ?? 0
  const rawShippingTotal = shipping_total ?? shipping_subtotal ?? 0
  const displayShippingTotal = normalizeInrShippingAmount(
    rawShippingTotal,
    displayItemTotal,
    currency_code
  )
  const displayTotal = getCartPayableTotal({
    item_total: displayItemTotal,
    shipping_total: rawShippingTotal,
    discount_total: discount_subtotal,
    total,
    currency_code,
  })
  const shippingLabel =
    shipping_methods?.at(-1)?.name?.trim() || "Standard"
  const shippingWasNormalized = shouldNormalizeInrShipping(
    rawShippingTotal,
    displayItemTotal,
    currency_code
  )

  if (variant === "checkout") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.14em] uppercase text-on-surface-muted">
          <span>Subtotal</span>
          <span data-testid="cart-subtotal" data-value={displayItemTotal}>
            <PriceText>
              {convertToLocale({ amount: displayItemTotal, currency_code })}
            </PriceText>
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.14em] uppercase text-on-surface-muted">
          <span>Shipping · {shippingLabel}</span>
          <span data-testid="cart-shipping" data-value={displayShippingTotal}>
            <PriceText>
              {convertToLocale({ amount: displayShippingTotal, currency_code })}
            </PriceText>
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.14em] uppercase text-primary-container">
            <span>Discount</span>
            <span data-testid="cart-discount" data-value={discount_subtotal || 0}>
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
        <div className="border-t rule-ink pt-5 flex items-end justify-between gap-4">
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-on-surface">
            Total
          </span>
          <span
            className="font-garamond serif-display font-medium text-on-surface leading-none"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.35rem)", fontStyle: "normal" }}
            data-testid="cart-total"
            data-value={displayTotal}
          >
            <PriceText>
              {convertToLocale({ amount: displayTotal, currency_code })}
            </PriceText>
          </span>
        </div>
        {!!tax_total && !shippingWasNormalized && (
          <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-on-surface-disabled text-right">
            Includes taxes{" "}
            <PriceText>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </PriceText>
          </p>
        )}
      </div>
    )
  }

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
