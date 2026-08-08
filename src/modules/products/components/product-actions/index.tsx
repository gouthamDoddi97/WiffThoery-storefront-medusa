"use client"

import { useAddToCart } from "@lib/hooks/use-add-to-cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import VariantSelect from "@modules/products/components/product-actions/variant-select"
import { productUsesVariantPicker } from "@lib/util/variant-label"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import Spinner from "@modules/common/icons/spinner"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>()
  const { add, isAdding, warmCart } = useAddToCart()

  const usesVariantPicker = useMemo(
    () => productUsesVariantPicker(product),
    [product]
  )

  // Preselect from URL or when only one variant exists
  useEffect(() => {
    const variants = product.variants ?? []
    if (variants.length === 1) {
      const variantOptions = optionsAsKeymap(variants[0].options)
      setOptions(variantOptions ?? {})
      setSelectedVariantId(variants[0].id)
      return
    }

    if (!usesVariantPicker) {
      return
    }

    const fromUrl = searchParams.get("v_id")
    if (fromUrl && variants.some((v) => v.id === fromUrl)) {
      setSelectedVariantId(fromUrl)
    }
  }, [product.variants, usesVariantPicker, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    if (usesVariantPicker) {
      return product.variants.find((v) => v.id === selectedVariantId)
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options, selectedVariantId, usesVariantPicker])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    if (usesVariantPicker) {
      return !!selectedVariantId
    }

    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options, selectedVariantId, usesVariantPicker])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    const qs = params.toString()
    const newUrl = pathname + (qs ? `?${qs}` : "")
    window.history.replaceState(null, "", newUrl)
    window.dispatchEvent(new CustomEvent("variant-changed", { detail: { variantId: value } }))
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null
    await add({ variantId: selectedVariant.id, quantity: 1 })
  }

  // Primary action: if no variant is selected, focus/scroll to options
  const handlePrimaryAction = () => {
    if (!selectedVariant) {
      const optionButton = actionsRef.current?.querySelector('[data-testid="product-options"] button')
      if (optionButton && optionButton instanceof HTMLElement) {
        optionButton.focus()
        optionButton.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    void handleAddToCart()
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {usesVariantPicker ? (
                <VariantSelect
                  variants={product.variants ?? []}
                  currentVariantId={selectedVariantId}
                  onSelect={setSelectedVariantId}
                  title="Variant"
                  data-testid="product-options"
                  disabled={!!disabled || isAdding}
                />
              ) : (
                (product.options || []).map((option) => (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                ))
              )}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        <button
          onClick={handlePrimaryAction}
          onMouseEnter={warmCart}
          disabled={
            !!disabled ||
            isAdding ||
            (selectedVariant ? (!inStock || !isValidVariant) : false)
          }
          className="w-full bg-primary-container text-[#FFFBF5] font-grotesk font-semibold text-xs tracking-[0.15em] uppercase py-4 transition-all duration-300 hover:bg-primary hover:shadow-card disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          data-testid="add-product-button"
        >
          {isAdding ? (
            <>
              <Spinner size="14" color="currentColor" />
              <span>ADDING...</span>
            </>
          ) : !selectedVariant ? (
            "SELECT VARIANT"
          ) : !inStock || !isValidVariant ? (
            "OUT OF STOCK"
          ) : (
            "ADD TO CART"
          )}
        </button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          selectedVariantId={selectedVariantId}
          usesVariantPicker={usesVariantPicker}
          onSelectVariant={setSelectedVariantId}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
