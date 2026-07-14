import { retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
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

  const customer = await retrieveCustomer()

  const shippingMethods = cart ? (await listCartShippingMethods(cart.id)) ?? [] : []
  const paymentMethods = cart?.region?.id
    ? (await listCartPaymentMethods(cart.region.id)) ?? []
    : []

  return (
    <CartTemplate
      cart={cart}
      customer={customer}
      shippingMethods={shippingMethods}
      paymentMethods={paymentMethods}
    />
  )
}
