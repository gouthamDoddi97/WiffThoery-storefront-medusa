import { HttpTypes } from "@medusajs/types"
import { formatVariantDisplayLabel } from "@lib/util/variant-label"

export const FREE_SHIPPING_THRESHOLD = 99900

export function formatManifestNumber(cartId?: string | null): string {
  if (!cartId) return "MANIFEST Nº 0000"
  const suffix = cartId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()
  const numeric = suffix.replace(/\D/g, "")
  const display = (numeric || suffix).padStart(4, "0").slice(-4)
  return `MANIFEST Nº ${display}`
}

export function formatCartItemCount(count: number): string {
  return String(count).padStart(2, "0")
}

export function formatCartLineMeta(item: HttpTypes.StoreCartLineItem): string {
  const product =
    (item as HttpTypes.StoreCartLineItem & { product?: HttpTypes.StoreProduct }).product ??
    item.variant?.product
  const variant = item.variant

  const sizeLabel = variant ? formatVariantDisplayLabel(variant).toUpperCase() : ""
  const perfumeType = String(product?.metadata?.perfume_type ?? "APPAREL PERFUME").toUpperCase()
  const concentration = String(product?.metadata?.concentration ?? "25%")
  const batchRaw = product?.metadata?.batch_no
  const batchNo = batchRaw
    ? `BATCH Nº ${String(batchRaw).replace(/\D/g, "").padStart(3, "0").slice(-3)}`
    : ""

  return [sizeLabel, perfumeType, concentration, batchNo].filter(Boolean).join(" · ")
}

export function getFreeShippingProgress(itemSubtotal?: number | null) {
  const current = itemSubtotal ?? 0
  const target = FREE_SHIPPING_THRESHOLD
  const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const remaining = Math.max(0, target - current)
  const unlocked = current >= target

  return { progress, remaining, unlocked, target }
}
