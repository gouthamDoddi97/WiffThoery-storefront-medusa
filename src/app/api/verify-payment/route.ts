import { NextResponse } from "next/server"
import { logCartPayment } from "@lib/debug/cart-payment"
import {
  verifyRazorpayPaymentSignature,
  RazorpayAuthError,
} from "@lib/razorpay/server"

type VerifyPaymentBody = {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

export async function POST(request: Request) {
  let body: VerifyPaymentBody

  try {
    body = (await request.json()) as VerifyPaymentBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    logCartPayment("api/verify-payment", "rejected — missing fields", {
      hasOrderId: Boolean(razorpay_order_id),
      hasPaymentId: Boolean(razorpay_payment_id),
      hasSignature: Boolean(razorpay_signature),
    })
    return NextResponse.json(
      {
        error:
          "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      },
      { status: 400 }
    )
  }

  logCartPayment("api/verify-payment", "request", {
    razorpay_order_id,
    razorpay_payment_id,
  })

  try {
    const valid = verifyRazorpayPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!valid) {
      logCartPayment("api/verify-payment", "invalid signature", {
        razorpay_order_id,
        razorpay_payment_id,
      })
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    logCartPayment("api/verify-payment", "success", {
      razorpay_order_id,
      razorpay_payment_id,
    })

    return NextResponse.json({
      success: true,
      razorpay_order_id,
      razorpay_payment_id,
    })
  } catch (err) {
    logCartPayment("api/verify-payment", "failed", {
      razorpay_order_id,
      razorpay_payment_id,
      error: err instanceof Error ? err.message : String(err),
    })
    if (err instanceof RazorpayAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }

    console.error("[api/verify-payment]", err)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
