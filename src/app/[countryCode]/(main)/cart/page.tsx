import { retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
  robots: { index: false, follow: false },
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })

  const [customer, shippingMethods] = await Promise.all([
    retrieveCustomer(),
    cart ? listCartShippingMethods(cart.id).then((m) => m ?? []) : Promise.resolve([]),
  ])

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      shippingMethods={shippingMethods}
    />
  )
}
