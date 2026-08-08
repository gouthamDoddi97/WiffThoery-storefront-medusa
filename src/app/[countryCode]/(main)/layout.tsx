import { Metadata } from "next"
import { Suspense } from "react"

import { retrieveCart } from "@lib/data/cart"
import { NAV_CART_FIELDS } from "@lib/cart/cart-fields"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import NavigationProgress from "@modules/layout/components/navigation-progress"
import MobileBottomNav from "@modules/layout/components/mobile-bottom-nav"
import FreeShippingNudgeLoader from "@modules/shipping/components/free-shipping-price-nudge/loader"
import WarmCart from "@modules/layout/components/warm-cart"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(undefined, NAV_CART_FIELDS),
  ])

  return (
    <>
      <WarmCart />
      <NavigationProgress />
      <Nav cart={cart} />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <Suspense fallback={null}>
          <FreeShippingNudgeLoader cart={cart} />
        </Suspense>
      )}
      <div className="pb-[68px] small:pb-0">{props.children}</div>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
