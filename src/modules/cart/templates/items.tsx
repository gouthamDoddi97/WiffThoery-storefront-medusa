import { HttpTypes } from "@medusajs/types"

import CartItemsClient from "./items-client"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

/** Server wrapper — client logic lives in items-client.tsx for a stable RSC boundary. */
export default function ItemsTemplate({ cart }: ItemsTemplateProps) {
  return <CartItemsClient cart={cart} />
}
