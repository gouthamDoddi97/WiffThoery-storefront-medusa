"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { Text, clx, useToggleState } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const TIERS = [
  {
    num: "01",
    label: "POPULAR",
    sub: "Universally loved, instantly wearable",
    href: "/categories/popular",
    handle: "popular" as const,
    accent: "text-primary",
    border: "border-primary/30",
    hoverOverlay: "rgba(79,219,204,0.15)",
  },
  {
    num: "02",
    label: "UNIQUE",
    sub: "Your first step into something deeper",
    href: "/categories/unique",
    handle: "unique" as const,
    accent: "text-tertiary",
    border: "border-tertiary/30",
    hoverOverlay: "rgba(255,181,71,0.15)",
  },
  {
    num: "03",
    label: "IDGF",
    sub: "For those who wear to provoke",
    href: "/categories/idgf",
    handle: "idgf" as const,
    accent: "text-secondary",
    border: "border-secondary/30",
    hoverOverlay: "rgba(255,107,90,0.15)",
  },
]

const UTILITY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/store" },
  { label: "Scent Personality", href: "/journey" },
  { label: "Account", href: "/account" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
]

type TierImages = {
  "popular": string | null
  "unique": string | null
  "idgf": string | null
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  tierImages?: TierImages
}

const SideMenu = ({ regions, locales, currentLocale, tierImages }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-ui-fg-base font-inter text-[11px] tracking-[0.18em] uppercase"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/60 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-x-4"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-4"
              >
                <PopoverPanel className="flex flex-col fixed top-0 left-0 w-[85vw] sm:w-[360px] h-screen z-[51] text-on-surface">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex flex-col h-full bg-surface-lowest border-r border-surface-variant/20 justify-between overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-surface-variant/20">
                      <span className="font-grotesk font-bold text-xs tracking-[0.22em] text-on-surface-disabled uppercase">
                        Whiff Theory
                      </span>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <XMark />
                      </button>
                    </div>

                    {/* Tiers — the hero section */}
                    <div className="px-4 pt-6 pb-4">
                      <p className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled px-2 mb-3">
                        Shop by Tier
                      </p>
                      <ul className="flex flex-col gap-2">
                        {TIERS.map((tier) => {
                          const img = tierImages?.[tier.handle]
                          return (
                          <li key={tier.href}>
                            <LocalizedClientLink
                              href={tier.href}
                              onClick={close}
                              className={`relative flex items-center gap-4 px-3 py-4 border ${tier.border} overflow-hidden transition-colors duration-200 group`}
                            >
                              {/* Background image */}
                              {img && (
                                <img
                                  src={img}
                                  alt=""
                                  aria-hidden
                                  className="absolute inset-0 w-full h-full object-cover object-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                                />
                              )}
                              {/* Tinted hover overlay */}
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ background: tier.hoverOverlay }}
                              />
                              {/* Big tier number */}
                              <span className={`relative font-grotesk font-bold text-3xl leading-none ${tier.accent} opacity-60 group-hover:opacity-100 transition-opacity w-10 flex-shrink-0`}>
                                {tier.num}
                              </span>
                              <div className="relative flex flex-col gap-0.5 min-w-0">
                                <span className="font-grotesk font-bold text-base tracking-[-0.01em] text-on-surface">
                                  {tier.label}
                                </span>
                                <span className="font-inter text-[10px] text-on-surface-disabled leading-tight">
                                  {tier.sub}
                                </span>
                              </div>
                              <svg
                                className={`relative ml-auto flex-shrink-0 ${tier.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                                width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"
                              >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                              </svg>
                            </LocalizedClientLink>
                          </li>
                          )
                        })}
                      </ul>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 border-t border-surface-variant/20" />

                    {/* Utility links */}
                    <div className="px-6 py-5 flex-1">
                      <p className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled mb-3">
                        Navigate
                      </p>
                      <ul className="flex flex-col gap-1">
                        {UTILITY_LINKS.map(({ label, href }) => (
                          <li key={href}>
                            <LocalizedClientLink
                              href={href}
                              onClick={close}
                              className="flex items-center justify-between py-2.5 font-inter text-sm text-on-surface-variant hover:text-on-surface transition-colors duration-150"
                              data-testid={`${label.toLowerCase().replace(" ", "-")}-link`}
                            >
                              {label}
                              <ArrowRightMini className="opacity-40" />
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer — locale/country + copyright */}
                    <div className="px-6 py-5 border-t border-surface-variant/20 flex flex-col gap-4">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between items-center"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between items-center"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small text-on-surface-disabled">
                        © {new Date().getFullYear()} Whiff Theory
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
