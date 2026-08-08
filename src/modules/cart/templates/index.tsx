import ItemsTemplate from "./items"
import EmptyCartMessage from "../components/empty-cart-message"
import ResetCartButton from "../components/reset-cart-button"
import SignInPrompt from "../components/sign-in-prompt"
import CartCheckoutPanel from "@modules/cart/components/cart-checkout-panel"
import {
  formatCartItemCount,
  formatManifestNumber,
} from "@modules/cart/lib/cart-display"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
  shippingMethods,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  shippingMethods: HttpTypes.StoreCartShippingOption[]
}) => {
  const itemCount = cart?.items?.length ?? 0

  return (
    <div className="bg-surface-lowest min-h-screen py-12 small:py-16">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_540px] gap-10 lg:gap-14 items-start">
            <div className="flex flex-col min-w-0">
              <div className="mb-8 small:mb-10">
                <h1
                  className="font-garamond serif-display font-medium text-on-surface leading-none"
                  style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", fontStyle: "normal" }}
                >
                  Your cart
                </h1>
                <p className="mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface-muted">
                  {formatCartItemCount(itemCount)} {itemCount === 1 ? "ITEM" : "ITEMS"} ·{" "}
                  {formatManifestNumber(cart.id)}
                </p>
              </div>

              {!customer && (
                <div className="mb-6 p-4 border-l-2 border-primary bg-surface-high/60">
                  <SignInPrompt />
                </div>
              )}

              <ItemsTemplate cart={cart} />

              <div className="mt-8 pt-6 border-t rule-ink">
                <ResetCartButton />
              </div>
            </div>

            <div className="relative lg:sticky lg:top-24">
              {cart.region && (
                <CartCheckoutPanel
                  cart={cart as HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] }}
                  customer={customer}
                  shippingMethods={shippingMethods}
                />
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-12">
              <h1
                className="font-garamond serif-display font-medium text-on-surface leading-none"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", fontStyle: "normal" }}
              >
                Your cart
              </h1>
            </div>
            <EmptyCartMessage />
            <div className="mt-6">
              <ResetCartButton label="Start a new cart" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
