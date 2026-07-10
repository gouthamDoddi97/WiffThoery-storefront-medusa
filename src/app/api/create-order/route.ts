import { NextResponse } from "next/server"
import {
  createRazorpayOrder,
  RazorpayAuthError,
  RazorpayValidationError,
  RazorpayApiError,
} from "@lib/razorpay/server"

type CreateOrderBody = {
  amount?: number
  currency?: string
  receipt?: string
}

export async function POST(request: Request) {
  let body: CreateOrderBody

  try {
    body = (await request.json()) as CreateOrderBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (body.amount === undefined || body.amount === null) {
    return NextResponse.json({ error: "amount is required" }, { status: 400 })
  }

  try {
    const order = await createRazorpayOrder({
      amount: body.amount,
      currency: body.currency,
      receipt: body.receipt,
    })

    return NextResponse.json(order)
  } catch (err) {
    if (err instanceof RazorpayValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    if (err instanceof RazorpayAuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    if (err instanceof RazorpayApiError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status >= 500 ? 500 : err.status }
      )
    }

    console.error("[api/create-order]", err)
    return NextResponse.json(
      { error: "Failed to create Razorpay order" },
      { status: 500 }
    )
  }
}
