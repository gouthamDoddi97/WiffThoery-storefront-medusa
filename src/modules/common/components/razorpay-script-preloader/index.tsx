"use client"

import Script from "next/script"
import { useEffect } from "react"

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

type RazorpayScriptPreloaderProps = {
  /** When true, preconnect + load Razorpay checkout.js in the background. */
  enabled: boolean
}

/**
 * Loads Razorpay checkout.js before the user clicks Pay so v2-entry chunks
 * are fetched during delivery/payment steps instead of all at once on open().
 */
export default function RazorpayScriptPreloader({
  enabled,
}: RazorpayScriptPreloaderProps) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return

    const hosts = [
      "https://checkout.razorpay.com",
      "https://api.razorpay.com",
    ]

    for (const href of hosts) {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
        continue
      }
      const link = document.createElement("link")
      link.rel = "preconnect"
      link.href = href
      link.crossOrigin = "anonymous"
      document.head.appendChild(link)
    }
  }, [enabled])

  if (!enabled) {
    return null
  }

  return (
    <Script
      id="razorpay-checkout-js"
      src={CHECKOUT_SCRIPT}
      strategy="afterInteractive"
    />
  )
}
