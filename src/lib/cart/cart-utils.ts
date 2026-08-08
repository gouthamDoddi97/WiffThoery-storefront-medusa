/** True when Medusa has already converted this cart into an order. */
export function isCartCompleted(
  cart: { completed_at?: string | Date | null } | null | undefined
): boolean {
  return Boolean(cart?.completed_at)
}

export function isCartAlreadyCompletedError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ""

  return /already completed/i.test(message)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Unknown error"
}
