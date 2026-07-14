import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import CartFreeShippingBar from "@modules/cart/components/free-shipping-bar"
import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        {items
          ? items
              .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
              .map((item) => (
                <Item key={item.id} item={item} currencyCode={cart?.currency_code} />
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

export default ItemsTemplate
