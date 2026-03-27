import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { getCollectionTiers } from "@lib/data/collection-tier"

const NAV_LINKS = [
  { label: "CROWD PLEASERS", href: "/categories/crowd-pleaser" },
  { label: "INTRO TO NICHE", href: "/categories/intro-to-niche" },
  { label: "POLARIZING ART", href: "/categories/polarizing-art" },
  { label: "ARCHIVE", href: "/store" },
]

export default async function Nav() {
  const [regions, locales, currentLocale, tierMap] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getCollectionTiers(),
  ])

  const tierImages = {
    "crowd-pleaser": tierMap["crowd-pleaser"]?.image_url ?? null,
    "intro-to-niche": tierMap["intro-to-niche"]?.image_url ?? null,
    "polarizing-art": tierMap["polarizing-art"]?.image_url ?? null,
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header
        className="relative h-16 mx-auto"
        style={{
          background: "rgba(49, 52, 66, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <nav className="content-container flex items-center justify-between w-full h-full">
          {/* Left — mobile menu / desktop collection links */}
          <div className="flex-1 basis-0 h-full flex items-center">
            {/* Mobile hamburger */}
            <div className="small:hidden h-full flex items-center">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                tierImages={tierImages}
              />
            </div>
            {/* Desktop collection tier links */}
            <div className="hidden small:flex items-center gap-x-8 h-full">
              {NAV_LINKS.map((link) => (
                <LocalizedClientLink
                  key={link.href}
                  href={link.href}
                  className="font-inter font-medium text-[11px] tracking-[0.18em] text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </LocalizedClientLink>
              ))}
            </div>
          </div>

          {/* Center — wordmark */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="font-grotesk font-bold text-sm tracking-[0.2em] text-on-surface hover:text-primary transition-colors duration-200 uppercase"
              data-testid="nav-store-link"
            >
              WHIFF THEORY
            </LocalizedClientLink>
          </div>

          {/* Right — account, wishlist, cart */}
          <div className="flex items-center gap-x-5 h-full flex-1 basis-0 justify-end">
            <LocalizedClientLink
              href="/account"
              className="hidden small:flex text-on-surface-variant hover:text-primary transition-colors duration-200"
              data-testid="nav-account-link"
              aria-label="Account"
            >
              {/* Person icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/wishlist"
              className="hidden small:flex text-on-surface-variant hover:text-primary transition-colors duration-200"
              aria-label="Wishlist"
            >
              {/* Heart icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-primary flex items-center gap-1 font-inter text-sm"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  {/* Bag icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  <span className="text-[11px] tracking-widest">0</span>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
