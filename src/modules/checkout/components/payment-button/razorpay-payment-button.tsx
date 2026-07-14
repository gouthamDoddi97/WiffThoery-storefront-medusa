"use client"

import { placeOrder, updateCart } from "@lib/data/cart"
import {
  createRazorpayCheckoutOrder,
  verifyRazorpayCheckoutPayment,
} from "@lib/razorpay/client"
import { getRazorpayPublicKey } from "@lib/razorpay/config"
import { logCartPayment } from "@lib/debug/cart-payment"
import { getCartPayableTotal, toRazorpayAmount } from "@lib/util/medusa-amount"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCallback, useEffect, useState } from "react"
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
  buttonLabel = "Pay with Razorpay",
  buttonClassName = "btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
  onBeforePay,
}: {
  notReady: boolean
  cart: HttpTypes.StoreCart
  "data-testid"?: string
  buttonLabel?: string
  buttonClassName?: string
  onBeforePay?: () => Promise<boolean>
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { Razorpay, isLoading: razorpayScriptLoading } = useRazorpay()
  const [razorpayScriptReady, setRazorpayScriptReady] = useState(false)

  // react-razorpay leaves isLoading=true when checkout.js is already on the page
  useEffect(() => {
    if (typeof window !== "undefined" && "Razorpay" in window) {
      setRazorpayScriptReady(true)
      return
    }

    if (!razorpayScriptLoading) {
      setRazorpayScriptReady(true)
    }
  }, [razorpayScriptLoading])

  const buttonDisabled = submitting || notReady || !razorpayScriptReady

  useEffect(() => {
    logCartPayment("button", "state", {
      cartId: cart.id,
      buttonDisabled,
      submitting,
      notReady,
      razorpayScriptReady,
      razorpayScriptLoading,
      hasRazorpayConstructor: Boolean(Razorpay),
      hasPublicKey: Boolean(getRazorpayPublicKey()),
      itemTotal: cart.item_total,
      shippingTotal: cart.shipping_total,
      cartTotal: cart.total,
      payableTotal: getCartPayableTotal({
        item_total: cart.item_total,
        shipping_total: cart.shipping_total,
        discount_total: cart.discount_total,
        total: cart.total,
        currency_code: cart.currency_code ?? "inr",
      }),
      razorpayAmount: toRazorpayAmount(
        getCartPayableTotal({
          item_total: cart.item_total,
          shipping_total: cart.shipping_total,
          discount_total: cart.discount_total,
          total: cart.total,
          currency_code: cart.currency_code ?? "inr",
        }),
        cart.currency_code ?? "inr"
      ),
      paymentSessions:
        cart.payment_collection?.payment_sessions?.map((s) => ({
          id: s.id,
          status: s.status,
        })) ?? [],
    })
  }, [
    cart.id,
    cart.item_total,
    cart.shipping_total,
    cart.total,
    cart.discount_total,
    cart.currency_code,
    cart.payment_collection?.payment_sessions,
    buttonDisabled,
    submitting,
    notReady,
    razorpayScriptReady,
    razorpayScriptLoading,
    Razorpay,
  ])

  const completeOrder = useCallback(async (payment: RazorpaySuccessResponse) => {
    logCartPayment("button", "completeOrder:start", {
      cartId: cart.id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
    })
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
    logCartPayment("button", "completeOrder:success", { cartId: cart.id })
  }, [cart.metadata, cart.id])

  const handlePayment = useCallback(async () => {
    logCartPayment("button", "handlePayment:click", { cartId: cart.id })

    const publicKey = getRazorpayPublicKey()
    if (!publicKey) {
      logCartPayment("button", "handlePayment:blocked — no public key")
      setErrorMessage(
        "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local and restart the dev server."
      )
      return
    }

    if (!Razorpay) {
      logCartPayment("button", "handlePayment:blocked — Razorpay constructor missing")
      setErrorMessage("Razorpay checkout is still loading. Please try again.")
      return
    }

    const payableTotal = getCartPayableTotal({
      item_total: cart.item_total,
      shipping_total: cart.shipping_total,
      discount_total: cart.discount_total,
      total: cart.total,
      currency_code: cart.currency_code ?? "inr",
    })
    const amount = toRazorpayAmount(payableTotal, cart.currency_code ?? "inr")

    logCartPayment("button", "handlePayment:amounts", {
      cartId: cart.id,
      itemTotal: cart.item_total,
      shippingTotal: cart.shipping_total,
      cartTotal: cart.total,
      payableTotal,
      razorpayAmountPaise: amount,
      currency: cart.currency_code ?? "inr",
    })

    if (amount < 100) {
      logCartPayment("button", "handlePayment:blocked — amount below minimum", { amount })
      setErrorMessage("Order total must be at least ₹1.00 to pay online.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      if (onBeforePay) {
        logCartPayment("button", "handlePayment:onBeforePay:start")
        const ready = await onBeforePay()
        logCartPayment("button", "handlePayment:onBeforePay:done", { ready })
        if (!ready) {
          setSubmitting(false)
          return
        }
      }

      logCartPayment("button", "handlePayment:createOrder:start", {
        amount,
        receipt: cart.id,
      })

      const order = await createRazorpayCheckoutOrder({
        amount,
        currency: (cart.currency_code ?? "inr").toUpperCase(),
        receipt: cart.id,
      })

      logCartPayment("button", "handlePayment:createOrder:success", {
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
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
          logCartPayment("button", "razorpay:payment.failed", {
            description: response.error?.description,
          })
          setSubmitting(false)
          setErrorMessage(response.error?.description ?? "Payment failed.")
        }
      )
      logCartPayment("button", "razorpay:open")
      razorpay.open()
    } catch (err) {
      logCartPayment("button", "handlePayment:error", {
        message: err instanceof Error ? err.message : String(err),
      })
      setSubmitting(false)
      setErrorMessage(
        err instanceof Error ? err.message : "Could not start Razorpay checkout."
      )
    }
  }, [Razorpay, cart, completeOrder, onBeforePay])

  return (
    <>
      <button
        disabled={buttonDisabled}
        onClick={() => void handlePayment()}
        type="button"
        data-testid={dataTestId}
        className={buttonClassName}
      >
        {submitting ? (
          <>
            <Spinner size="14" color="currentColor" />
            Processing…
          </>
        ) : (
          buttonLabel
        )}
      </button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}
