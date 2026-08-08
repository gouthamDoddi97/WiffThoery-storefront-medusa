export const CART_OPTIMISTIC_DELTA = "wt:cart-optimistic-delta"
export const CART_UPDATED = "wt:cart-updated"
export const CART_LINE_REMOVING = "wt:cart-line-removing"
export const CART_LINE_QUANTITY = "wt:cart-line-quantity"
export const CART_OPTIMISTIC_RESET = "wt:cart-optimistic-reset"

export function emitCartOptimisticDelta(delta: number) {
  if (typeof window === "undefined" || !delta) return
  window.dispatchEvent(
    new CustomEvent(CART_OPTIMISTIC_DELTA, { detail: { delta } })
  )
}

export function emitCartUpdated(totalItems: number) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED, { detail: { totalItems } })
  )
}

export function emitCartLineRemoving(lineId: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(CART_LINE_REMOVING, { detail: { lineId } })
  )
}

export function emitCartLineQuantity(lineId: string, quantity: number) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(CART_LINE_QUANTITY, { detail: { lineId, quantity } })
  )
}

export function emitCartOptimisticReset() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(CART_OPTIMISTIC_RESET))
}
