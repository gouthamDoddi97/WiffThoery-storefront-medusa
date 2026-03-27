"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  return (
    <div className="bg-surface-low p-6">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface flex items-center gap-2">
          01 SHIPPING DETAILS
          {!isOpen && <CheckCircleSolid className="text-primary" />}
        </h2>
        {!isOpen && cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className="font-inter text-[10px] tracking-[0.15em] text-primary hover:text-primary/80 transition-colors"
            data-testid="edit-address-button"
          >
            EDIT
          </button>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <h3 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface pb-6 pt-8">
                  BILLING ADDRESS
                </h3>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          {cart && cart.shipping_address ? (
            <div className="flex items-start gap-8 flex-wrap">
              <div className="flex flex-col gap-1 min-w-[160px]" data-testid="shipping-address-summary">
                <span className="font-grotesk text-[9px] tracking-[0.2em] text-on-surface-variant mb-1">SHIPPING ADDRESS</span>
                <span className="font-inter text-xs text-on-surface">{cart.shipping_address.first_name} {cart.shipping_address.last_name}</span>
                <span className="font-inter text-xs text-on-surface-variant">{cart.shipping_address.address_1} {cart.shipping_address.address_2}</span>
                <span className="font-inter text-xs text-on-surface-variant">{cart.shipping_address.postal_code}, {cart.shipping_address.city}</span>
                <span className="font-inter text-xs text-on-surface-variant">{cart.shipping_address.country_code?.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[160px]" data-testid="shipping-contact-summary">
                <span className="font-grotesk text-[9px] tracking-[0.2em] text-on-surface-variant mb-1">CONTACT</span>
                <span className="font-inter text-xs text-on-surface-variant">{cart.shipping_address.phone}</span>
                <span className="font-inter text-xs text-on-surface-variant">{cart.email}</span>
              </div>
              <div className="flex flex-col gap-1 min-w-[160px]" data-testid="billing-address-summary">
                <span className="font-grotesk text-[9px] tracking-[0.2em] text-on-surface-variant mb-1">BILLING ADDRESS</span>
                {sameAsBilling ? (
                  <span className="font-inter text-xs text-on-surface-variant">Same as shipping address.</span>
                ) : (
                  <>
                    <span className="font-inter text-xs text-on-surface">{cart.billing_address?.first_name} {cart.billing_address?.last_name}</span>
                    <span className="font-inter text-xs text-on-surface-variant">{cart.billing_address?.address_1} {cart.billing_address?.address_2}</span>
                    <span className="font-inter text-xs text-on-surface-variant">{cart.billing_address?.postal_code}, {cart.billing_address?.city}</span>
                    <span className="font-inter text-xs text-on-surface-variant">{cart.billing_address?.country_code?.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <Spinner />
          )}
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
