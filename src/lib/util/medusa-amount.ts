const ZERO_DECIMAL_CURRENCIES = new Set(["jpy", "krw", "vnd"])

/**
 * Medusa returns INR flat-rate shipping in paise (e.g. 9900 = ₹99) while
 * line items use rupees (e.g. 300 = ₹300).
 */
export function shouldNormalizeInrShipping(
  shippingAmount: number,
  itemTotal: number,
  currencyCode: string
): boolean {
  const code = currencyCode.toLowerCase()
  return code === "inr" && itemTotal > 0 && shippingAmount >= itemTotal * 10
}

export function normalizeInrShippingAmount(
  shippingAmount: number,
  itemTotal: number,
  currencyCode: string
): number {
  if (!shouldNormalizeInrShipping(shippingAmount, itemTotal, currencyCode)) {
    return shippingAmount
  }

  return shippingAmount / 100
}

export function getCartPayableTotal(input: {
  item_total?: number | null
  shipping_total?: number | null
  discount_total?: number | null
  total?: number | null
  currency_code: string
}): number {
  const itemTotal = input.item_total ?? 0
  const shippingTotal = input.shipping_total ?? 0
  const discountTotal = input.discount_total ?? 0
  const normalizedShipping = normalizeInrShippingAmount(
    shippingTotal,
    itemTotal,
    input.currency_code
  )

  if (
    shouldNormalizeInrShipping(
      shippingTotal,
      itemTotal,
      input.currency_code
    )
  ) {
    return Math.max(0, itemTotal + normalizedShipping - discountTotal)
  }

  return input.total ?? Math.max(0, itemTotal + shippingTotal - discountTotal)
}

/**
 * Medusa storefront cart totals are in major currency units (e.g. INR rupees).
 * Razorpay expects the smallest currency unit (paise for INR).
 */
export function toRazorpayAmount(
  amount: number,
  currencyCode: string
): number {
  const code = currencyCode.toLowerCase()

  if (!Number.isFinite(amount)) {
    return 0
  }

  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(amount)
  }

  return Math.round(amount * 100)
}
