"use client"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface-variant">
        CURATION SUMMARY
      </h2>

      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />

      <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
        className="block w-full"
      >
        <button className="btn-primary w-full text-center">
          PROCEED TO CHECKOUT
        </button>
      </LocalizedClientLink>

      <p className="font-inter text-[10px] text-on-surface-disabled text-center leading-relaxed">
        FREE SHIPPING ON ORDERS OVER ₹2,500
      </p>
    </div>
  )
}

export default Summary

