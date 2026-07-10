import React from "react"
import { CreditCard } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const RAZORPAY_STANDARD_CHECKOUT_ID = "razorpay_standard"

export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
  pp_razorpay_razorpay: {
    title: "Razorpay",
    icon: <CreditCard />,
  },
  [RAZORPAY_STANDARD_CHECKOUT_ID]: {
    title: "Razorpay",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

export const isRazorpay = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_razorpay") ||
    providerId === RAZORPAY_STANDARD_CHECKOUT_ID
  )
}

export const isRazorpayStandardCheckoutEnabled = () => {
  return Boolean(process.env.NEXT_PUB_RAZORPAY_KEY_ID)
}

/** Medusa checkout uses manual session + metadata when paying via Standard Checkout. */
export const isRazorpayStandardCheckout = (
  cart: HttpTypes.StoreCart,
  providerId?: string
) => {
  if (isRazorpay(providerId)) {
    return true
  }

  return (
    isManual(providerId) &&
    cart.metadata?.wt_payment === "razorpay" &&
    isRazorpayStandardCheckoutEnabled()
  )
}

/** Label shown in checkout summaries when Razorpay Standard Checkout is active. */
export const getPaymentMethodTitle = (
  providerId?: string,
  cart?: HttpTypes.StoreCart | null
) => {
  if (providerId && isRazorpay(providerId)) {
    return "Razorpay"
  }
  if (
    cart &&
    isManual(providerId) &&
    cart.metadata?.wt_payment === "razorpay" &&
    isRazorpayStandardCheckoutEnabled()
  ) {
    return "Razorpay"
  }
  if (providerId && paymentInfoMap[providerId]?.title) {
    return paymentInfoMap[providerId].title
  }
  return providerId ?? ""
}
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
