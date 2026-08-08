const ZERO_DECIMAL_CURRENCIES = new Set(["jpy", "krw", "vnd"])

/**
 * Medusa returns INR flat-rate shipping in paise (e.g. 9900 = ₹99, 4700 = ₹47)
 * while line items use rupees (e.g. 1100 = ₹1100).
 */
export function shouldNormalizeInrShipping(
  shippingAmount: number,
  itemTotal: number,
  currencyCode?: string | null
): boolean {
  const code = (currencyCode ?? "inr").toLowerCase()
  if (code !== "inr" || shippingAmount <= 0) {
    return false
  }

  const asRupees = shippingAmount / 100

  // Legacy: small carts where shipping paise dwarfs item total in raw units
  if (itemTotal > 0 && shippingAmount >= itemTotal * 10) {
    return true
  }

  // Domestic shipping stored in paise (multiples of 100, ≥ ₹10)
  if (
    shippingAmount >= 1000 &&
    shippingAmount % 100 === 0 &&
    asRupees >= 10 &&
    asRupees <= 2500
  ) {
    return true
  }

  return false
}

export function normalizeInrShippingAmount(
  shippingAmount: number,
  itemTotal: number,
  currencyCode?: string | null
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
  currency_code?: string | null
  metadata?: Record<string, unknown> | null
}): number {
  const currencyCode = input.currency_code ?? "inr"
  const itemTotal = input.item_total ?? 0
  const shippingTotal = input.shipping_total ?? 0
  const discountTotal = input.discount_total ?? 0
  const shiprocketRate = getShiprocketRateInr(input.metadata)

  if (shiprocketRate != null) {
    return Math.max(0, itemTotal + shiprocketRate - discountTotal)
  }

  const normalizedShipping = normalizeInrShippingAmount(
    shippingTotal,
    itemTotal,
    currencyCode
  )

  if (
    shouldNormalizeInrShipping(
      shippingTotal,
      itemTotal,
      currencyCode
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
  currencyCode?: string | null
): number {
  const code = (currencyCode ?? "inr").toLowerCase()

  if (!Number.isFinite(amount)) {
    return 0
  }

  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(amount)
  }

  return Math.round(amount * 100)
}

type DisplayTotalsInput = {
  currency_code?: string | null
  item_total?: number | null
  item_subtotal?: number | null
  item_tax_total?: number | null
  shipping_subtotal?: number | null
  shipping_total?: number | null
  shipping_tax_total?: number | null
  tax_total?: number | null
  discount_total?: number | null
  discount_subtotal?: number | null
  total?: number | null
  metadata?: Record<string, unknown> | null
}

export function getShiprocketRateInr(
  metadata?: Record<string, unknown> | null
): number | null {
  const shiprocket = metadata?.shiprocket as { rate_inr?: number } | undefined
  if (shiprocket?.rate_inr != null && Number.isFinite(shiprocket.rate_inr)) {
    return shiprocket.rate_inr
  }
  return null
}

/**
 * Normalizes INR cart/order totals for display. Medusa returns flat-rate
 * shipping in paise (9900) while line items use rupees (300).
 */
export function getDisplayTotals(input: DisplayTotalsInput) {
  const currency_code = input.currency_code ?? "inr"
  const itemTotal = input.item_total ?? input.item_subtotal ?? 0
  const itemSubtotal = input.item_subtotal ?? input.item_total ?? 0
  const rawShippingTotal = input.shipping_total ?? input.shipping_subtotal ?? 0
  const rawShippingSubtotal =
    input.shipping_subtotal ?? input.shipping_total ?? 0

  const shiprocketRate = getShiprocketRateInr(input.metadata)

  let shippingSubtotal = normalizeInrShippingAmount(
    rawShippingSubtotal,
    itemTotal,
    currency_code
  )
  let shippingTotal = normalizeInrShippingAmount(
    rawShippingTotal,
    itemTotal,
    currency_code
  )

  if (shiprocketRate != null) {
    shippingSubtotal = shiprocketRate
    shippingTotal = shiprocketRate
  }

  const shippingWasNormalized =
    shiprocketRate == null &&
    shouldNormalizeInrShipping(rawShippingTotal, itemTotal, currency_code)

  const itemTax = input.item_tax_total ?? 0
  const rawShippingTax = input.shipping_tax_total ?? 0
  const shippingTax = shippingWasNormalized ? rawShippingTax / 100 : rawShippingTax
  const taxTotal =
    shippingWasNormalized && input.shipping_tax_total != null
      ? itemTax + shippingTax
      : (input.tax_total ?? itemTax + shippingTax)

  const discountTotal = input.discount_subtotal ?? input.discount_total ?? 0
  let displayTotal = getCartPayableTotal({
    item_total: itemTotal,
    shipping_total: rawShippingTotal,
    discount_total: discountTotal,
    total: input.total,
    currency_code,
    metadata: input.metadata,
  })

  // Orders often store flat Standard Shipping (₹99) while checkout selected Shiprocket.
  if (
    shiprocketRate != null &&
    input.total != null &&
    Number(input.total) > 0
  ) {
    const storedShipping = normalizeInrShippingAmount(
      rawShippingTotal,
      itemTotal,
      currency_code
    )
    if (storedShipping > shiprocketRate) {
      displayTotal = Math.max(
        0,
        Number(input.total) - (storedShipping - shiprocketRate)
      )
    }
  }

  return {
    itemSubtotal,
    itemTotal,
    shippingSubtotal,
    shippingTotal,
    taxTotal,
    discountTotal,
    displayTotal,
    shippingWasNormalized,
  }
}

export function normalizeInrShippingLineAmount(
  amount: number,
  itemTotal: number,
  currencyCode?: string | null
): number {
  return normalizeInrShippingAmount(amount, itemTotal, currencyCode)
}
