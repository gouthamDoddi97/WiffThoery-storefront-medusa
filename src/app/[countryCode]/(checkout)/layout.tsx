import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-surface-lowest relative small:min-h-screen">
      {/* Checkout nav bar */}
      <div className="h-16 bg-surface-low border-b border-surface-variant/30">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-x-2 font-grotesk text-[10px] tracking-[0.15em] text-on-surface-variant hover:text-primary transition-colors flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={14} />
            <span className="hidden small:block">BACK TO COLLECTION</span>
            <span className="block small:hidden">BACK</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="font-grotesk font-bold text-sm tracking-[0.2em] text-on-surface hover:text-primary transition-colors"
            data-testid="store-link"
          >
            WHIFF THEORY
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
    </div>
  )
}
