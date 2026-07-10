import { convertToLocale } from "@lib/util/money"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const { total, original_total } = item
  const hasReducedPrice = total < original_total

  const percentage_diff = Math.round(
    ((original_total - total) / original_total) * 100
  )

  return (
    <div className="flex flex-col text-on-surface-variant justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-on-surface-muted">Original: </span>
            )}
            <span
              className="line-through text-on-surface-muted"
              data-testid="product-unit-original-price"
            >
              <PriceText>
                {convertToLocale({
                  amount: original_total / item.quantity,
                  currency_code: currencyCode,
                })}
              </PriceText>
            </span>
          </p>
          {style === "default" && (
            <span className="text-primary-container font-medium">
              -{percentage_diff}%
            </span>
          )}
        </>
      )}
      <span
        className={clx("font-inter text-sm", {
          "text-primary-container font-semibold": hasReducedPrice,
          "text-on-surface": !hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        <PriceText>
          {convertToLocale({
            amount: total / item.quantity,
            currency_code: currencyCode,
          })}
        </PriceText>
      </span>
    </div>
  )
}

export default LineItemUnitPrice
