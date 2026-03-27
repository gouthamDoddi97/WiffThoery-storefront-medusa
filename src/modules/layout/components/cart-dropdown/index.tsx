"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full flex items-center" aria-label="Cart">
          <LocalizedClientLink
            className="text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-1.5"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className="font-inter text-[11px] tracking-widest text-primary">{totalItems}</span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-surface-container border border-surface-variant/40 w-[420px] shadow-card"
            data-testid="nav-cart-dropdown"
            style={{ backdropFilter: "blur(16px)" }}
          >
            <div className="px-5 py-4 border-b border-surface-variant/30 flex items-center justify-between">
              <h3 className="font-grotesk font-semibold text-sm tracking-[0.1em] uppercase text-on-surface">Your Collection</h3>
              {totalItems > 0 && (
                <span className="font-inter text-xs text-on-surface-variant">{totalItems} fragment{totalItems !== 1 ? "s" : ""}</span>
              )}
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-5 grid grid-cols-1 gap-y-6 no-scrollbar py-4">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-24"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-col overflow-ellipsis mr-4 flex-1">
                              <h3 className="font-grotesk font-medium text-sm text-on-surface overflow-hidden text-ellipsis whitespace-nowrap">
                                <LocalizedClientLink
                                  href={`/products/${item.product_handle}`}
                                  data-testid="product-link"
                                  className="hover:text-primary transition-colors"
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h3>
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <span
                                className="font-inter text-xs text-on-surface-variant mt-0.5"
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                Qty: {item.quantity}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <LineItemPrice
                                item={item}
                                style="tight"
                                currencyCode={cartState.currency_code}
                              />
                              <DeleteButton
                                id={item.id}
                                data-testid="cart-item-remove-button"
                                className="text-on-surface-disabled hover:text-secondary transition-colors text-xs font-inter"
                              >
                                Remove
                              </DeleteButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="px-5 py-4 border-t border-surface-variant/30 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-xs tracking-[0.1em] uppercase text-on-surface-variant">
                      Subtotal
                    </span>
                    <span
                      className="font-grotesk font-semibold text-on-surface"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <button
                      className="w-full bg-gradient-cta text-surface-lowest font-grotesk font-semibold text-xs tracking-[0.15em] uppercase py-3 transition-opacity hover:opacity-90"
                      data-testid="go-to-cart-button"
                    >
                      VIEW COLLECTION
                    </button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div>
                <div className="flex py-16 flex-col gap-4 items-center justify-center">
                  <p className="font-inter text-sm text-on-surface-variant text-center">
                    Your collection is empty.
                  </p>
                  <LocalizedClientLink href="/store" onClick={close}>
                    <button className="btn-ghost text-xs py-2 px-6">
                      EXPLORE COLLECTION
                    </button>
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
