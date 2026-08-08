import { convertToLocale } from "@lib/util/money"
import { normalizeInrShippingLineAmount } from "@lib/util/medusa-amount"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const shippingMethodTotal = order.shipping_methods?.[0]?.total ?? 0
  const itemTotal = order.item_total ?? order.item_subtotal ?? 0
  const shiprocket = order.metadata?.shiprocket as
    | { courier_name?: string; rate_inr?: number }
    | undefined

  const displayShippingTotal =
    shiprocket?.rate_inr != null
      ? shiprocket.rate_inr
      : normalizeInrShippingLineAmount(
          shippingMethodTotal,
          itemTotal,
          order.currency_code
        )

  const methodName =
    shiprocket?.courier_name
      ? `${shiprocket.courier_name} via Shiprocket`
      : order.shipping_methods?.[0]?.name ?? "Shipping"

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular mt-2 mb-6">
        Delivery
      </Heading>
      <div className="flex flex-col small:flex-row items-start gap-y-6 small:gap-x-8">
        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Contact</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>

        <div
          className="flex flex-col w-full small:w-1/3"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {methodName} (
            <PriceText>
              {convertToLocale({
                amount: displayShippingTotal,
                currency_code: order.currency_code,
              })}
            </PriceText>
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails
