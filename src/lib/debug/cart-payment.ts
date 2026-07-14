const TAG = "[cart-payment]"

type LogPayload = Record<string, unknown>

export function logCartPayment(
  scope: string,
  message: string,
  data?: LogPayload
) {
  if (process.env.NODE_ENV === "production") {
    return
  }

  if (data !== undefined) {
    console.log(`${TAG} [${scope}] ${message}`, data)
    return
  }

  console.log(`${TAG} [${scope}] ${message}`)
}
