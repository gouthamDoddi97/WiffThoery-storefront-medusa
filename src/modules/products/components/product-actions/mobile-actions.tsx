import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@medusajs/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import ChevronDown from "@modules/common/icons/chevron-down"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import PriceText from "@modules/common/components/price-text"
import OptionSelect from "./option-select"
import VariantSelect from "./variant-select"
import { formatVariantOptionLabel } from "@lib/util/variant-label"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  selectedVariantId?: string
  usesVariantPicker?: boolean
  onSelectVariant?: (variantId: string) => void
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  selectedVariantId,
  usesVariantPicker = false,
  onSelectVariant,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({
    product: product,
    variantId: variant?.id,
  })

  const selectedPrice = useMemo(() => {
    if (!price) {
      return null
    }
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="bg-surface-lowest flex flex-col gap-y-3 justify-center items-center text-large-regular p-4 h-full w-full border-t border-surface-variant/30"
            data-testid="mobile-actions"
          >
            <div className="flex items-center gap-x-2 text-on-surface">
              <span data-testid="mobile-title">{product.title}</span>
              <span>—</span>
              {selectedPrice ? (
                <div className="flex items-end gap-x-2 text-on-surface font-grotesk font-semibold">
                  {selectedPrice.price_type === "sale" && (
                    <p>
                      <span className="line-through text-small-regular text-on-surface-muted">
                        <PriceText>{selectedPrice.original_price}</PriceText>
                      </span>
                    </p>
                  )}
                  <span
                    className={clx({
                      "text-primary-container":
                        selectedPrice.price_type === "sale",
                    })}
                  >
                    <PriceText>{selectedPrice.calculated_price}</PriceText>
                  </span>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            <div className={clx("grid grid-cols-2 w-full gap-x-4", {
              "!grid-cols-1": isSimple
            })}>
              {!isSimple && <Button
                onClick={open}
                variant="secondary"
                className="w-full"
                data-testid="mobile-actions-button"
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                      {variant
                        ? usesVariantPicker
                          ? formatVariantOptionLabel(variant)
                          : Object.values(options).join(" /\u00A0")
                        : "SELECT OPTIONS"}
                  </span>
                  <ChevronDown />
                </div>
              </Button>}
              <Button
                onClick={() => {
                  if (!variant) {
                    open()
                  } else {
                    void handleAddToCart()
                  }
                }}
                disabled={isAdding || (variant ? !inStock : false) || optionsDisabled}
                className="w-full"
                isLoading={isAdding}
                data-testid="mobile-cart-button"
              >
                {!variant
                  ? "SELECT VARIANT"
                  : !inStock
                  ? "OUT OF STOCK"
                  : "ADD TO CART"}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-700 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0">
            <div className="flex min-h-full h-full items-center justify-center text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel
                  className="w-full h-full transform overflow-hidden text-left flex flex-col gap-y-3"
                  data-testid="mobile-actions-modal"
                >
                  <div className="w-full flex justify-end pr-6">
                    <button
                      onClick={close}
                      className="bg-surface-low w-12 h-12 rounded-full text-on-surface flex justify-center items-center border border-surface-variant/30 hover:bg-surface-container transition-colors"
                      data-testid="close-modal-button"
                    >
                      <X />
                    </button>
                  </div>
                  <div className="bg-surface-lowest px-6 py-12">
                    {(product.variants?.length ?? 0) > 1 && (
                      <div className="flex flex-col gap-y-6">
                        {usesVariantPicker ? (
                          <VariantSelect
                            variants={product.variants ?? []}
                            currentVariantId={selectedVariantId}
                            onSelect={(id) => onSelectVariant?.(id)}
                            title="Variant"
                            disabled={optionsDisabled}
                          />
                        ) : (
                          (product.options || []).map((option) => (
                            <div key={option.id}>
                              <OptionSelect
                                option={option}
                                current={options[option.id]}
                                updateOption={updateOptions}
                                title={option.title ?? ""}
                                disabled={optionsDisabled}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
