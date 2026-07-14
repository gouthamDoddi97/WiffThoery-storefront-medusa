/** Public Razorpay key — must be available in the browser bundle. */
export function getRazorpayPublicKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.NEXT_PUB_RAZORPAY_KEY_ID
  )
}

export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayPublicKey())
}
