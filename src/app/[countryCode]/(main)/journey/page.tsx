import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"
import { redirect } from "next/navigation"
import JourneyClient from "./journey-client"

export const metadata: Metadata = {
  title: "My Scent Journey | Whiff Theory",
  description: "Your personal fragrance evolution — mapped across tiers, notes, and time.",
  robots: { index: false, follow: false },
}

export default async function JourneyPage() {
  const customer = await retrieveCustomer()

  if (!customer) {
    redirect("/account")
  }

  const orders = await listOrders(50, 0).catch(() => null)

  return <JourneyClient customer={customer} orders={orders ?? []} />
}
