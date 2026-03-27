"use client"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)
    await updateLineItem({ lineId: item.id, quantity })
      .catch((err) => setError(err.message))
      .finally(() => setUpdating(false))
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  if (type === "preview") {
    return (
      <div className="flex gap-3 items-start py-3" data-testid="product-row">
        <LocalizedClientLink href={`/products/${item.product_handle}`} className="flex-shrink-0 w-14 aspect-[3/4] bg-surface-container overflow-hidden">
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
        </LocalizedClientLink>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-grotesk text-xs font-semibold text-on-surface truncate">{item.product_title}</span>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
          <div className="flex justify-between items-center mt-1">
            <span className="font-inter text-xs text-on-surface-variant">{item.quantity}×</span>
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-6 items-start" data-testid="product-row">
      {/* Product info */}
      <div className="flex gap-4 items-start">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="flex-shrink-0 w-20 aspect-[3/4] bg-surface-container overflow-hidden"
        >
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" />
        </LocalizedClientLink>
        <div className="flex flex-col gap-1 min-w-0">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <span className="font-grotesk text-sm font-semibold text-on-surface hover:text-primary transition-colors" data-testid="product-title">
              {item.product_title}
            </span>
          </LocalizedClientLink>
          <LineItemOptions variant={item.variant} data-testid="product-variant" />
          <div className="mt-2">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      </div>

      {/* Qty */}
      <div className="flex flex-col items-center gap-1 w-28">
        <div className="flex gap-2 items-center">
          <CartItemSelect
            value={item.quantity}
            onChange={(value) => changeQuantity(parseInt(value.target.value))}
            className="w-14 h-9 bg-surface-container border border-surface-variant/40 text-on-surface font-inter text-sm px-2"
            data-testid="product-select-button"
          >
            {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => (
              <option value={i + 1} key={i}>{i + 1}</option>
            ))}
          </CartItemSelect>
          {updating && <Spinner />}
        </div>
      </div>

      {/* Unit price */}
      <div className="hidden small:flex items-start justify-end w-20">
        <LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} />
      </div>

      {/* Total */}
      <div className="flex items-start justify-end w-20">
        <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
      </div>
    </div>
  )
}

export default Item

