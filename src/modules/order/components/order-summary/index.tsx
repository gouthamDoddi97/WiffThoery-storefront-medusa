import { convertToLocale } from "@lib/util/money"
import { getDisplayTotals } from "@lib/util/medusa-amount"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"

type OrderSummaryProps = {
  order: HttpTypes.StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
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

  const getAmount = (amount?: number | null) => {
    if (amount === undefined || amount === null) {
      return
    }

    return convertToLocale({
      amount,
      currency_code: order.currency_code,
    })
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <h2 className="text-base-semi text-white mb-3">Order Summary</h2>
      <div className="text-small-regular text-white/70 my-2">
        <div className="flex items-center justify-between text-base-regular text-white/80 mb-2">
          <span>Subtotal</span>
          <span><PriceText>{getAmount(display.itemSubtotal) ?? ""}</PriceText></span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- <PriceText>{getAmount(order.discount_total) ?? ""}</PriceText></span>
            </div>
          )}
          {order.gift_card_total > 0 && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- <PriceText>{getAmount(order.gift_card_total) ?? ""}</PriceText></span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span><PriceText>{getAmount(display.shippingTotal) ?? ""}</PriceText></span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span><PriceText>{getAmount(display.taxTotal) ?? ""}</PriceText></span>
          </div>
        </div>
        <div className="h-px w-full border-b border-white/15 border-dashed my-4" />
        <div className="flex items-center justify-between text-base-regular text-white font-semibold mb-2">
          <span>Total</span>
          <span><PriceText>{getAmount(display.displayTotal) ?? ""}</PriceText></span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
