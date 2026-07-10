import { NextResponse } from "next/server"
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
    return NextResponse.json(
      {
        error:
          "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
      },
      { status: 400 }
    )
  }

  try {
    const valid = verifyRazorpayPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      razorpay_order_id,
      razorpay_payment_id,
    })
  } catch (err) {
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
