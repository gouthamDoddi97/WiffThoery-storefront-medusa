import { listCartOptions } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import FreeShippingPriceNudge from "./index"

/** Loads shipping options in Suspense so the main layout is not blocked. */
export default async function FreeShippingNudgeLoader({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  if (!cart.items?.length) {
    return null
  }

  const { shipping_options } = await listCartOptions()

  return (
    <FreeShippingPriceNudge
      variant="popup"
      cart={cart}
      shippingOptions={shipping_options}
    />
  )
}
