import { Container, Heading, Text } from "@medusajs/ui"

import { getPaymentMethodTitle, paymentInfoMap } from "@lib/constants"
import {
  getDisplayTotals,
  normalizeInrShippingAmount,
} from "@lib/util/medusa-amount"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

/**
 * Payment amounts can be wrong when Medusa stores shipping in paise
 * (9900) and adds it to item rupees (300) → 10200. Prefer order totals.
 */
function getPaidAmount(order: HttpTypes.StoreOrder, paymentAmount?: number) {
  const display = getDisplayTotals({
    currency_code: order.currency_code,
    item_total: order.item_total,
    item_subtotal: order.item_subtotal,
    item_tax_total: order.item_tax_total,
    shipping_subtotal: order.shipping_subtotal,
    shipping_total: order.shipping_total,
    shipping_tax_total: order.shipping_tax_total,
    tax_total: order.tax_total,
    discount_total: order.discount_total,
    total: order.total,
    metadata: order.metadata,
  })

  if (paymentAmount == null || !Number.isFinite(paymentAmount)) {
    return display.displayTotal
  }

  const itemTotal = order.item_total ?? order.item_subtotal ?? 0
  const rawShipping = order.shipping_total ?? order.shipping_subtotal ?? 0
  const bogusCombo = itemTotal + rawShipping

  // Classic paise+rupees bug: payment.amount === item_rupees + shipping_paise
  if (
    order.currency_code.toLowerCase() === "inr" &&
    Math.round(paymentAmount) === Math.round(bogusCombo) &&
    shouldLookLikePaiseShipping(rawShipping, itemTotal)
  ) {
    return display.displayTotal
  }

  // Payment stored in paise while order totals are rupees
  if (
    order.currency_code.toLowerCase() === "inr" &&
    paymentAmount >= 1000 &&
    paymentAmount % 100 === 0 &&
    Math.abs(paymentAmount / 100 - display.displayTotal) < 1
  ) {
    return paymentAmount / 100
  }

  // Prefer order total when payment is wildly larger than order
  if (paymentAmount > display.displayTotal * 5) {
    return display.displayTotal
  }

  return paymentAmount
}

function shouldLookLikePaiseShipping(shipping: number, itemTotal: number) {
  return (
    shipping >= 1000 &&
    shipping % 100 === 0 &&
    normalizeInrShippingAmount(shipping, itemTotal, "inr") !== shipping
  )
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const providerId = payment?.provider_id
  const methodTitle =
    order.metadata?.wt_payment === "razorpay"
      ? "Razorpay"
      : getPaymentMethodTitle(providerId) ||
        paymentInfoMap[providerId ?? ""]?.title ||
        "Payment"

  const icon =
    paymentInfoMap[providerId ?? ""]?.icon ??
    paymentInfoMap.pp_system_default?.icon

  const paidAmount = getPaidAmount(order, payment?.amount)
  const razorpayPaymentId =
    typeof order.metadata?.razorpay_payment_id === "string"
      ? order.metadata.razorpay_payment_id
      : null

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Payment
      </Heading>
      <div>
        {(payment || order.metadata?.wt_payment === "razorpay") && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {methodTitle}
              </Text>
              {razorpayPaymentId && (
                <Text className="txt-small text-ui-fg-muted mt-1 font-mono">
                  {razorpayPaymentId}
                </Text>
              )}
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment details
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {icon}
                </Container>
                <Text data-testid="payment-amount">
                  <PriceText>
                    {convertToLocale({
                      amount: paidAmount,
                      currency_code: order.currency_code,
                    })}
                  </PriceText>{" "}
                  paid
                  {payment?.created_at
                    ? ` at ${new Date(payment.created_at).toLocaleString()}`
                    : ""}
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
