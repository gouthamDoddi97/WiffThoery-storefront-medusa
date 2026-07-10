"use client"

import { placeOrder, updateCart } from "@lib/data/cart"
import {
  createRazorpayCheckoutOrder,
  verifyRazorpayCheckoutPayment,
} from "@lib/razorpay/client"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCallback, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"

type RazorpaySuccessResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export const RazorpayPaymentButton = ({
  notReady,
  cart,
  "data-testid": dataTestId,
}: {
  notReady: boolean
  cart: HttpTypes.StoreCart
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { Razorpay, isLoading: razorpayLoading } = useRazorpay()

  const completeOrder = useCallback(async (payment: RazorpaySuccessResponse) => {
    await verifyRazorpayCheckoutPayment({
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
    })

    await updateCart({
      metadata: {
        ...(cart.metadata ?? {}),
        wt_payment: "razorpay",
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
      },
    })

    await placeOrder()
  }, [cart.metadata])

  const handlePayment = useCallback(async () => {
    const publicKey = process.env.NEXT_PUB_RAZORPAY_KEY_ID
    if (!publicKey) {
      setErrorMessage("Razorpay is not configured on the storefront.")
      return
    }

    if (!Razorpay) {
      setErrorMessage("Razorpay checkout is still loading. Please try again.")
      return
    }

    const amount = Math.round(Number(cart.total ?? 0))
    if (amount < 100) {
      setErrorMessage("Order total must be at least ₹1.00 to pay online.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const order = await createRazorpayCheckoutOrder({
        amount,
        currency: (cart.currency_code ?? "inr").toUpperCase(),
        receipt: cart.id,
      })

      const options: RazorpayOrderOptions = {
        key: publicKey,
        amount: order.amount,
        order_id: order.order_id,
        currency: order.currency.toUpperCase() as CurrencyCode,
        name: process.env.NEXT_PUBLIC_SHOP_NAME ?? "Whiff Theory",
        description:
          process.env.NEXT_PUBLIC_SHOP_DESCRIPTION ??
          `Cart ${cart.id?.slice(-8) ?? ""}`,
        image: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/og-image.png`,
        prefill: {
          name: [cart.billing_address?.first_name, cart.billing_address?.last_name]
            .filter(Boolean)
            .join(" "),
          email: cart.email ?? undefined,
          contact:
            cart.shipping_address?.phone ??
            cart.billing_address?.phone ??
            undefined,
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
            setErrorMessage("Payment cancelled.")
          },
        },
        handler: (response: RazorpaySuccessResponse) => {
          void completeOrder(response).catch(() => {
            setErrorMessage(
              "Payment received but verification or order placement failed. Contact support."
            )
            setSubmitting(false)
          })
        },
      }

      const razorpay = new Razorpay(options)
      razorpay.on(
        "payment.failed",
        (response: { error?: { description?: string } }) => {
          setSubmitting(false)
          setErrorMessage(response.error?.description ?? "Payment failed.")
        }
      )
      razorpay.open()
    } catch (err) {
      setSubmitting(false)
      setErrorMessage(
        err instanceof Error ? err.message : "Could not start Razorpay checkout."
      )
    }
  }, [Razorpay, cart, completeOrder])

  return (
    <>
      <button
        disabled={submitting || notReady || razorpayLoading}
        onClick={() => void handlePayment()}
        type="button"
        data-testid={dataTestId}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <Spinner size="14" color="currentColor" />
            Processing…
          </>
        ) : (
          "Pay with Razorpay"
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}
