import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="bg-surface-lowest min-h-screen py-16">
      <div className="content-container" data-testid="cart-container">
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-12">
          <span className="eyebrow">FRAGRANCE</span>
          <h1 className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface tracking-[-0.02em]">
            YOUR COLLECTION
          </h1>
          {cart?.items?.length ? (
            <p className="font-inter text-sm text-on-surface-variant">
              {cart.items.length} {cart.items.length === 1 ? "FRAGMENT" : "FRAGMENTS"} IN YOUR CURATION
            </p>
          ) : null}
        </div>

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_380px] gap-12">
            {/* Left: Items */}
            <div className="flex flex-col gap-6">
              {!customer && (
                <div className="bg-surface-low p-5 border-l-2 border-primary">
                  <SignInPrompt />
                </div>
              )}
              <ItemsTemplate cart={cart} />
            </div>

            {/* Right: Summary */}
            <div className="relative">
              <div className="flex flex-col gap-6 sticky top-24">
                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-px bg-surface-variant/20">
                  {["GENUINE EXTRAIT", "GRAPHIC-ART PACKAGING", "TRANSPARENT PRICING"].map((badge) => (
                    <div key={badge} className="bg-surface-low py-4 px-3 flex items-center justify-center">
                      <span className="font-grotesk text-[9px] tracking-[0.15em] text-on-surface-variant text-center">
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>

                {cart && cart.region && (
                  <div className="bg-surface-low p-6">
                    <Summary cart={cart as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
