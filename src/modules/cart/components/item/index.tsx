"use client"

import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { formatCartLineMeta } from "@modules/cart/lib/cart-display"
import ErrorMessage from "@modules/checkout/components/error-message"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Spinner from "@modules/common/icons/spinner"
import QuantityStepper from "@modules/products/components/quantity-stepper"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const HAIRLINE = "color-mix(in srgb, var(--on-surface) 28%, transparent)"

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)
    try {
      if (quantity < 1) {
        await deleteLineItem(item.id)
      } else {
        await updateLineItem({ lineId: item.id, quantity })
      }
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update quantity")
    } finally {
      setUpdating(false)
    }
  }

  if (type === "preview") {
    return (
      <div className="flex gap-3 items-start py-3" data-testid="product-row">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="flex-shrink-0 w-14 aspect-square overflow-hidden bg-surface-container"
          style={{ border: `var(--hairline-width) solid ${HAIRLINE}` }}
        >
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.product_title ?? "Product"}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderImage size={20} />
            </div>
          )}
        </LocalizedClientLink>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="font-garamond text-sm text-on-surface truncate">{item.product_title}</span>
          <div className="flex justify-between items-center mt-1">
            <span className="font-mono text-[10px] text-on-surface-muted">{item.quantity}×</span>
            <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
          </div>
        </div>
      </div>
    )
  }

  const metaLine = formatCartLineMeta(item)

  return (
    <article className="py-8 border-b rule-ink" data-testid="product-row">
      <div className="flex gap-5 small:gap-6 items-start">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="relative flex-shrink-0 w-[88px] h-[88px] small:w-[104px] small:h-[104px] overflow-hidden bg-surface-container"
          style={{ border: `var(--hairline-width) solid ${HAIRLINE}` }}
        >
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.product_title ?? "Product"}
              fill
              className="object-cover object-center"
              sizes="104px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <PlaceholderImage size={32} />
            </div>
          )}
        </LocalizedClientLink>

        <div className="flex flex-1 min-w-0 items-start justify-between gap-4">
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <div>
              <LocalizedClientLink href={`/products/${item.product_handle}`}>
                <h3
                  className="font-garamond serif-display font-medium text-on-surface leading-tight hover:text-primary transition-colors"
                  style={{ fontSize: "clamp(1.35rem, 3vw, 1.75rem)", fontStyle: "normal" }}
                  data-testid="product-title"
                >
                  {item.product_title}
                </h3>
              </LocalizedClientLink>
              {metaLine && (
                <p className="mt-2 font-mono text-[9px] small:text-[10px] tracking-[0.14em] uppercase text-on-surface-muted leading-relaxed">
                  {metaLine}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <QuantityStepper
                value={item.quantity}
                onChange={changeQuantity}
                min={0}
                max={maxQuantity}
                disabled={updating}
              />
              {updating && <Spinner />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>

          <div className="flex-shrink-0 pt-1">
            <LineItemPrice item={item} style="cart" currencyCode={currencyCode} />
          </div>
        </div>
      </div>
    </article>
  )
}

export default Item
