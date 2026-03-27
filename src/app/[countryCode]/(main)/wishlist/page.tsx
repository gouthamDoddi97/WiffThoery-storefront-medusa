import { Metadata } from "next"
import WishlistClient from "./wishlist-client"

export const metadata: Metadata = {
  title: "On Your Radar | Whiff Theory",
  description: "Fragrances you're considering — your personal radar of future purchases.",
}

export default function WishlistPage() {
  return <WishlistClient />
}
