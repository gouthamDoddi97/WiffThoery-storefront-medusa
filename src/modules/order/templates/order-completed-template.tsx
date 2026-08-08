import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-surface-lowest min-h-[calc(100vh-64px)] py-12 small:py-16">
      <div className="content-container">
        <div
          className="mx-auto w-full max-w-5xl flex flex-col gap-y-8"
          data-testid="order-complete-container"
        >
          {isOnboarding && <OnboardingCta orderId={order.id} />}

          <header className="flex flex-col gap-3 border-b rule-ink pb-8">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface-muted">
              Order confirmed
            </p>
            <h1
              className="font-garamond serif-display font-medium text-on-surface leading-none"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontStyle: "normal",
              }}
            >
              Thank you!
            </h1>
            <p className="font-inter text-sm text-on-surface-variant max-w-xl">
              Your order was placed successfully.
            </p>
          </header>

          <OrderDetails order={order} />

          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 lg:gap-14 items-start">
            <div className="flex flex-col gap-6 min-w-0">
              <h2 className="font-garamond text-2xl text-on-surface">Summary</h2>
              <Items order={order} />
              <CartTotals
                totals={{
                  ...order,
                  currency_code: order.currency_code ?? "inr",
                }}
              />
            </div>

            <div className="flex flex-col gap-8 min-w-0">
              <ShippingDetails order={order} />
              <PaymentDetails order={order} />
              <Help />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
