import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import PriceText from "@modules/common/components/price-text"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight" | "cart"
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
    <div className={clx("flex flex-col gap-x-2 text-on-surface-variant", {
      "items-end text-right": style === "cart",
    })}>
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
          className={clx({
            "font-garamond serif-display font-medium text-on-surface leading-none":
              style === "cart",
            "font-inter text-sm text-primary-container font-semibold":
              style !== "cart" && hasReducedPrice,
            "font-inter text-sm text-on-surface font-medium":
              style !== "cart" && !hasReducedPrice,
          })}
          style={
            style === "cart"
              ? { fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", fontStyle: "normal" }
              : undefined
          }
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
