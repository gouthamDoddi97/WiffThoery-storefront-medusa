"use client"

import repeat from "@lib/util/repeat"
import { useOptimisticCartItems } from "@lib/hooks/use-optimistic-cart-items"
import { HttpTypes } from "@medusajs/types"

import CartFreeShippingBar from "@modules/cart/components/free-shipping-bar"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type CartItemsClientProps = {
  cart?: HttpTypes.StoreCart
}

export default function CartItemsClient({ cart }: CartItemsClientProps) {
  const items = useOptimisticCartItems(cart)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {cart
          ? items
              .sort((a, b) =>
                (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              )
              .map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  currencyCode={cart.currency_code}
                />
              ))
          : repeat(3).map((i) => <SkeletonLineItem key={i} />)}
      </div>

      {cart && (
        <CartFreeShippingBar
          itemSubtotal={cart.item_subtotal}
          currencyCode={cart.currency_code}
        />
      )}
    </div>
  )
}
