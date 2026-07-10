export type RazorpayCreateOrderResponse = {
  order_id: string
  amount: number
  currency: string
}

export type RazorpayVerifyPaymentResponse = {
  success: boolean
  razorpay_order_id?: string
  razorpay_payment_id?: string
  error?: string
}

export async function createRazorpayCheckoutOrder(input: {
  amount: number
  currency?: string
  receipt?: string
}): Promise<RazorpayCreateOrderResponse> {
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = (await res.json()) as RazorpayCreateOrderResponse & {
    error?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Failed to create order")
  }

  return data
}

export async function verifyRazorpayCheckoutPayment(input: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}): Promise<RazorpayVerifyPaymentResponse> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = (await res.json()) as RazorpayVerifyPaymentResponse

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Payment verification failed")
  }

  return data
}
