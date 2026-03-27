import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-8 py-8 small:py-0">
      <div className="w-full bg-surface-low p-6 flex flex-col gap-6">
        <Divider className="my-0 small:hidden" />
        <h2 className="font-grotesk font-bold text-xs tracking-[0.2em] text-on-surface-variant">
          CURATION SUMMARY
        </h2>
        <Divider />
        <CartTotals totals={cart} />
        <ItemsPreviewTemplate cart={cart} />
        <div>
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary

