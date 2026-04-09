"use client"

import { Button } from "@medusajs/ui"
import { useMemo, useState } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderReviewForm from "@modules/account/components/order-review-form"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null)
  const [reviewingProductTitle, setReviewingProductTitle] = useState("")

  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  const openReview = (productId: string, title: string) => {
    setReviewingProductId(productId)
    setReviewingProductTitle(title)
  }

  return (
    <div className="bg-surface-low border border-surface-variant/20 flex flex-col p-4" data-testid="order-card">
      <div className="uppercase text-large-semi mb-1 text-on-surface">
        #<span data-testid="order-display-id">{order.display_id}</span>
      </div>
      <div className="flex items-center divide-x divide-surface-variant/40 text-small-regular text-on-surface-variant">
        <span className="pr-2" data-testid="order-created-at">
          {new Date(order.created_at).toDateString()}
        </span>
        <span className="px-2" data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <span className="pl-2">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
        {order.items?.slice(0, 3).map((i) => {
          return (
            <div
              key={i.id}
              className="flex flex-col gap-y-2"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-small-regular text-on-surface-variant">
                <span
                  className="text-on-surface font-semibold"
                  data-testid="item-title"
                >
                  {i.title}
                </span>
                <span className="ml-2">x</span>
                <span data-testid="item-quantity">{i.quantity}</span>
              </div>
              {i.product_id && (
                <button
                  onClick={() => openReview(i.product_id!, i.product_title ?? i.title ?? "")}
                  className="font-inter text-[9px] tracking-[0.15em] uppercase text-primary hover:opacity-70 transition-opacity text-left"
                >
                  Leave a review
                </button>
              )}
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-ui-fg-base">
              + {numberOfLines - 4}
            </span>
            <span className="text-small-regular text-ui-fg-base">more</span>
          </div>
        )}
      </div>

      {/* Inline review form */}
      {reviewingProductId && (
        <div className="mb-4">
          <OrderReviewForm
            productId={reviewingProductId}
            productTitle={reviewingProductTitle}
            onClose={() => setReviewingProductId(null)}
          />
        </div>
      )}

      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button data-testid="order-details-link" variant="secondary">
            See details
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
