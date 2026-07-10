import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col gap-x-2 text-on-surface-variant items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-on-surface-muted">Original: </span>
              )}
              <span
                className="line-through text-on-surface-muted"
                data-testid="product-original-price"
              >
                <PriceText>
                  {convertToLocale({
                    amount: originalPrice,
                    currency_code: currencyCode,
                  })}
                </PriceText>
              </span>
            </p>
            {style === "default" && (
              <span className="text-primary-container font-medium">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("font-inter text-sm", {
            "text-primary-container font-semibold": hasReducedPrice,
            "text-on-surface font-medium": !hasReducedPrice,
          })}
          data-testid="product-price"
        >
          <PriceText>
            {convertToLocale({
              amount: currentPrice,
              currency_code: currencyCode,
            })}
          </PriceText>
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
