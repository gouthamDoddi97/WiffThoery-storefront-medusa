"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { productUsesVariantPicker } from "@lib/util/variant-label"
import { HttpTypes } from "@medusajs/types"
import GalleryVariantSelect from "@modules/products/components/gallery-variant-select"
import QuantityStepper from "@modules/products/components/quantity-stepper"
import Spinner from "@modules/common/icons/spinner"
import { isEqual } from "lodash"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import OptionSelect from "@modules/products/components/product-actions/option-select"

type GalleryProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  accent?: string
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) =>
  variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {}) ?? {}

export default function GalleryProductActions({
  product,
  accent = "var(--tier-popular)",
  disabled,
}: GalleryProductActionsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const usesVariantPicker = useMemo(
    () => productUsesVariantPicker(product),
    [product]
  )

  useEffect(() => {
    const variants = product.variants ?? []
    if (variants.length === 1) {
      setOptions(optionsAsKeymap(variants[0].options) ?? {})
      setSelectedVariantId(variants[0].id)
      return
    }
    if (!usesVariantPicker) return
    const fromUrl = searchParams.get("v_id")
    if (fromUrl && variants.some((v) => v.id === fromUrl)) {
      setSelectedVariantId(fromUrl)
    }
  }, [product.variants, usesVariantPicker, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return undefined
    if (usesVariantPicker) {
      return product.variants.find((v) => v.id === selectedVariantId)
    }
    return product.variants.find((v) =>
      isEqual(optionsAsKeymap(v.options), options)
    )
  }, [product.variants, options, selectedVariantId, usesVariantPicker])

  const isValidVariant = useMemo(() => {
    if (usesVariantPicker) return !!selectedVariantId
    return product.variants?.some((v) =>
      isEqual(optionsAsKeymap(v.options), options)
    )
  }, [product.variants, options, selectedVariantId, usesVariantPicker])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null
    if (params.get("v_id") === value) return
    if (value) params.set("v_id", value)
    else params.delete("v_id")
    const qs = params.toString()
    window.history.replaceState(null, "", pathname + (qs ? `?${qs}` : ""))
    window.dispatchEvent(
      new CustomEvent("variant-changed", { detail: { variantId: value } })
    )
  }, [selectedVariant, isValidVariant, pathname, searchParams])

  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    if (!selectedVariant.manage_inventory) return true
    if (selectedVariant.allow_backorder) return true
    if (
      selectedVariant.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })
      router.refresh()
    } finally {
      setIsAdding(false)
    }
  }

  const canAdd =
    !!selectedVariant && isValidVariant && inStock && !disabled && !isAdding

  const ctaLabel = !selectedVariant
    ? "SELECT SIZE"
    : !inStock || !isValidVariant
    ? "OUT OF STOCK"
    : "ADD TO CART →"

  return (
    <>
      <div ref={actionsRef} className="flex flex-col gap-3">
        {/* Size pills */}
        {(product.variants?.length ?? 0) > 1 && (
          <>
            {usesVariantPicker ? (
              <GalleryVariantSelect
                variants={product.variants ?? []}
                currentVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
                accent={accent}
                disabled={!!disabled || isAdding}
              />
            ) : (
              (product.options || []).map((option) => (
                <OptionSelect
                  key={option.id}
                  option={option}
                  current={options[option.id]}
                  updateOption={(id, val) =>
                    setOptions((prev) => ({ ...prev, [id]: val }))
                  }
                  title={option.title ?? ""}
                  disabled={!!disabled || isAdding}
                />
              ))
            )}
          </>
        )}

        {/* Desktop buy row */}
        <div className="hidden small:flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            disabled={!!disabled || isAdding}
          />
          <button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={!canAdd}
            className="flex-1 h-10 rounded-sm font-mono text-[11px] tracking-[0.22em] uppercase text-[#FFFBF5] transition-opacity disabled:opacity-40"
            style={{ background: accent }}
            data-testid="add-product-button"
          >
            {isAdding ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner size="14" color="currentColor" />
                ADDING…
              </span>
            ) : (
              ctaLabel
            )}
          </button>
        </div>

        {/* Trust row */}
        <p className="hidden small:block font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted text-center">
          SHIPS PAN-INDIA · COD AVAILABLE
        </p>
      </div>

      {/* Mobile sticky buy bar */}
      <div
        className={`small:hidden fixed inset-x-0 bottom-[52px] z-40 bg-surface-lowest border-t rule-ink transition-transform duration-300 ${
          inView ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="content-container py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              disabled={!!disabled || isAdding}
            />
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={!canAdd}
              className="flex-1 h-10 rounded-sm font-mono text-[11px] tracking-[0.2em] uppercase text-[#FFFBF5] disabled:opacity-40"
              style={{ background: accent }}
              data-testid="mobile-cart-button"
            >
              {isAdding ? "ADDING…" : ctaLabel}
            </button>
          </div>
          <p className="font-mono text-[8px] tracking-[0.14em] uppercase text-on-surface-muted text-center">
            SHIPS PAN-INDIA · COD AVAILABLE
          </p>
        </div>
      </div>
    </>
  )
}
