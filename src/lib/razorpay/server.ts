import "server-only"
import crypto from "crypto"
import Razorpay from "razorpay"

const MIN_AMOUNT_PAISE = 100

export function getRazorpayCredentials() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ??
    process.env.RAZORPAY_TEST_KEY_ID ??
    process.env.RAZORPAY_ID
  const keySecret =
    process.env.RAZORPAY_KEY_SECRET ??
    process.env.RAZORPAY_TEST_KEY_SECRET ??
    process.env.RAZORPAY_SECRET

  if (!keyId || !keySecret) {
    return null
  }

  return { keyId, keySecret }
}

function getRazorpayClient() {
  const creds = getRazorpayCredentials()
  if (!creds) {
    return null
  }

  return new Razorpay({
    key_id: creds.keyId,
    key_secret: creds.keySecret,
  })
}

export type CreateRazorpayOrderInput = {
  amount: number
  currency?: string
  receipt?: string
}

export type CreateRazorpayOrderResult = {
  order_id: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<CreateRazorpayOrderResult> {
  const amount = Math.round(input.amount)
  if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
    throw new RazorpayValidationError(
      `Amount must be at least ${MIN_AMOUNT_PAISE} paise`
    )
  }

  const client = getRazorpayClient()
  if (!client) {
    throw new RazorpayAuthError("Razorpay credentials are not configured")
  }

  const currency = (input.currency ?? "INR").toUpperCase()
  const receipt = input.receipt?.slice(0, 40) ?? `rcpt_${Date.now()}`

  try {
    const order = await client.orders.create({
      amount,
      currency,
      receipt,
    })

    return {
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    }
  } catch (err: unknown) {
    throw mapRazorpayApiError(err)
  }
}

export type VerifyRazorpayPaymentInput = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export function verifyRazorpayPaymentSignature(
  input: VerifyRazorpayPaymentInput
): boolean {
  const creds = getRazorpayCredentials()
  if (!creds) {
    throw new RazorpayAuthError("Razorpay credentials are not configured")
  }

  const expected = crypto
    .createHmac("sha256", creds.keySecret)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest("hex")

  return expected === input.razorpay_signature
}

export class RazorpayValidationError extends Error {
  readonly status = 400
}

export class RazorpayAuthError extends Error {
  readonly status = 401
}

export class RazorpayApiError extends Error {
  readonly status: number

  constructor(message: string, status = 500) {
    super(message)
    this.status = status
  }
}

function mapRazorpayApiError(err: unknown): Error {
  if (err && typeof err === "object") {
    const statusCode =
      "statusCode" in err && typeof err.statusCode === "number"
        ? err.statusCode
        : 500
    const description =
      "error" in err &&
      err.error &&
      typeof err.error === "object" &&
      "description" in err.error &&
      typeof err.error.description === "string"
        ? err.error.description
        : err instanceof Error
          ? err.message
          : "Razorpay API error"

    if (statusCode === 401) {
      return new RazorpayAuthError(description)
    }

    return new RazorpayApiError(description, statusCode >= 400 ? statusCode : 500)
  }

  return new RazorpayApiError("Razorpay API error")
}
