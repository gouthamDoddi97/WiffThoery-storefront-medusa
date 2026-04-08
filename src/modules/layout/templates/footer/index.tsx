import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({ fields: "*products" })

  return (
    <footer className="bg-surface-lowest border-t border-surface-variant/30 w-full">
      <div className="content-container pt-20 pb-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-12 small:grid-cols-4 small:gap-8 mb-16">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-6 small:col-span-1">
            <LocalizedClientLink
              href="/"
              className="font-grotesk font-bold text-sm tracking-[0.2em] text-on-surface hover:text-primary transition-colors uppercase"
            >
              WHIFF THEORY
            </LocalizedClientLink>
            <p className="font-inter text-[11px] tracking-[0.2em] text-on-surface-variant uppercase">
              CRAFTED IN VIZAG. FOR THE WORLD.
            </p>
            <p className="font-garamond italic text-base text-on-surface-variant leading-relaxed max-w-[260px]">
              Each perfume carries a character, a mood, and a reason to exist.
            </p>
            {/* Newsletter */}
            <div className="flex flex-col gap-2 mt-2">
              <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
                JOIN THE JOURNEY
              </span>
              <div className="flex items-center border-b border-surface-variant focus-within:border-primary transition-colors duration-200">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent flex-1 font-inter text-sm text-on-surface placeholder:text-on-surface-disabled py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="text-primary hover:text-primary-container transition-colors pb-1"
                  aria-label="Subscribe"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Column 2 — The Ladder (collections) */}
          <div className="flex flex-col gap-4">
            <span className="font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
              THE LADDER
            </span>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  href="/categories/popular"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Popular
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/categories/unique"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Unique
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/categories/idgf"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  IDGF
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Archive
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div className="flex flex-col gap-4">
            <span className="font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
              COMPANY
            </span>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  href="/about"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Our Story
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/journey"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Scent Journal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Account
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 4 — Transparency */}
          <div className="flex flex-col gap-4">
            <span className="font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
              TRANSPARENCY
            </span>
            <ul className="flex flex-col gap-3">
              <li>
                <LocalizedClientLink
                  href="/about#pricing"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Pricing Philosophy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/about#sourcing"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Ingredient Sourcing
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account/orders"
                  className="font-inter text-sm text-on-surface-variant hover:text-primary transition-colors duration-200"
                >
                  Returns
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col small:flex-row w-full pt-8 border-t border-surface-variant/30 justify-between items-center gap-4">
          <p className="font-inter text-xs text-on-surface-disabled tracking-wide">
            © {new Date().getFullYear()} Whiff Theory. Independent. Always.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/whifftheory"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                <rect x="2" y="2" width="20" height="20" rx="0"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/whifftheory"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="X / Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.75-8.875L2.25 2.25h6.944l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

