"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"

const ITEMS = [
  {
    label: "SHOP",
    href: "/store",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "DISCOVER",
    href: "/journey",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="9" />
        <polygon points="12 7 15 15 9 12" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LAB",
    href: "/about",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M10 2v6L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8V2" />
        <line x1="8" y1="2" x2="16" y2="2" />
      </svg>
    ),
  },
  {
    label: "ME",
    href: "/account",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

/** Sticky bottom tab bar — mobile only, matches fableRedesign mockup. */
export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="small:hidden fixed inset-x-0 bottom-0 z-40 bg-surface-lowest border-t rule-ink"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const segment = item.href.replace(/^\//, "")
          const active =
            segment === "store"
              ? pathname.endsWith("/store") || pathname.includes("/products/")
              : pathname.includes(`/${segment}`)
          return (
            <LocalizedClientLink
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-3 text-on-surface-variant hover:text-on-surface transition-colors"
              style={{ color: active ? "var(--on-surface)" : undefined }}
            >
              {item.icon}
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase">
                {item.label}
              </span>
            </LocalizedClientLink>
          )
        })}
      </div>
    </nav>
  )
}
