import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div className="flex flex-col">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 pb-4 border-b border-surface-variant/30">
        <span className="font-grotesk text-[10px] tracking-[0.2em] text-on-surface-variant">FRAGMENT</span>
        <span className="font-grotesk text-[10px] tracking-[0.2em] text-on-surface-variant w-28 text-center">QTY</span>
        <span className="font-grotesk text-[10px] tracking-[0.2em] text-on-surface-variant hidden small:block w-20 text-right">UNIT</span>
        <span className="font-grotesk text-[10px] tracking-[0.2em] text-on-surface-variant w-20 text-right">TOTAL</span>
      </div>

      {/* Items */}
      <div className="flex flex-col divide-y divide-surface-variant/20">
        {items
          ? items
              .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
              .map((item) => (
                <Item key={item.id} item={item} currencyCode={cart?.currency_code} />
              ))
          : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
      </div>
    </div>
  )
}

export default ItemsTemplate
