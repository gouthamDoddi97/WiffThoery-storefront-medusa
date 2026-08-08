"use server"

import { cache } from "react"
import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale } from "@lib/data/locale-actions"
import { listProducts } from "./products"
import {
  getCartVariantId,
  productNeedsVariantSelection,
} from "@lib/util/get-cart-variant"
import { logCartPayment } from "@lib/debug/cart-payment"
import {
  isCartAlreadyCompletedError,
  isCartCompleted,
} from "@lib/cart/cart-utils"
import { findOrderByRazorpayPaymentId } from "@lib/data/orders"

async function discardStaleCartCookie() {
  await removeCartId()
  await revalidateCartCache()
}

/** Clear cookie when the cart was already completed (order placed). */
export async function clearStaleCartCookie() {
  await discardStaleCartCookie()
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
const retrieveCartCached = cache(
  async (
    cartId: string | undefined,
    fields: string | undefined
  ): Promise<HttpTypes.StoreCart | null> => {
    return fetchCart(cartId, fields, false)
  }
)

async function fetchCart(
  cartId: string | undefined,
  fields: string | undefined,
  noCache: boolean
): Promise<HttpTypes.StoreCart | null> {
  const cookieCartId = await getCartId()
  const id = cartId || cookieCartId
  const idFromCookie = !cartId && Boolean(cookieCartId)
  fields ??=
    "*items, *region, *shipping_address, *billing_address, email, +metadata, *items.product, *items.product.metadata, *items.variant, *items.variant.product, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = noCache
    ? undefined
    : {
        ...(await getCacheOptions("carts")),
      }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields: fields.includes("completed_at")
          ? fields
          : `${fields},+completed_at`,
      },
      headers,
      next,
      cache: noCache ? "no-store" : "force-cache",
    })
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      if (isCartCompleted(cart) && idFromCookie) {
        await discardStaleCartCookie()
        return null
      }
      return cart
    })
    .catch(() => null)
}

export async function retrieveCart(
  cartId?: string,
  fields?: string,
  options?: { noCache?: boolean }
) {
  if (options?.noCache) {
    return fetchCart(cartId, fields, true)
  }

  return retrieveCartCached(cartId, fields)
}

async function revalidateCartCache() {
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag("carts")
  if (cartCacheTag) {
    revalidateTag(cartCacheTag)
  }
}

function countCartItems(cart: HttpTypes.StoreCart | undefined | null): number {
  return (
    cart?.items?.reduce((acc, item) => acc + (item.quantity ?? 0), 0) ?? 0
  )
}

/** Ensures a cart exists (creates cookie if needed). Call on page load or button hover. */
export async function ensureCart(countryCode: string) {
  await getOrSetCart(countryCode)
}

export async function getOrSetCart(countryCode: string) {
  const [region, cartIdFromCookie, headers] = await Promise.all([
    getRegion(countryCode),
    getCartId(),
    getAuthHeaders(),
  ])

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = cartIdFromCookie
    ? await retrieveCart(cartIdFromCookie, "id,region_id,completed_at")
    : await retrieveCart(undefined, "id,region_id,completed_at")

  if (!cart) {
    const locale = await getLocale()
    const cartResp = await sdk.store.cart.create(
      { region_id: region.id, locale: locale || undefined },
      {},
      headers
    )
    cart = cartResp.cart

    await setCartId(cart.id)
    await revalidateCartCache()
  }

  if (cart && cart.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    await revalidateCartCache()
  }

  return cart
}

export async function updateCart(
  data: HttpTypes.StoreUpdateCart,
  options?: { revalidateFulfillment?: boolean; cartId?: string }
) {
  const cartId = options?.cartId ?? (await getCartId())

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      if (options?.revalidateFulfillment !== false) {
        const fulfillmentCacheTag = await getCacheTag("fulfillment")
        revalidateTag(fulfillmentCacheTag)
      }

      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}): Promise<{ totalItems: number }> {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const [headers, cartIdFromCookie] = await Promise.all([
    getAuthHeaders(),
    getCartId(),
  ])

  let cartId = cartIdFromCookie

  if (!cartId) {
    cartId = (await getOrSetCart(countryCode)).id
  }

  const addLineItem = (id: string) =>
    sdk.store.cart.createLineItem(
      id,
      {
        variant_id: variantId,
        quantity,
      },
      { fields: "*items" },
      headers
    )

  let response: { cart: HttpTypes.StoreCart }

  try {
    response = await addLineItem(cartId)
  } catch (error) {
    if (isCartAlreadyCompletedError(error)) {
      await discardStaleCartCookie()
      cartId = (await getOrSetCart(countryCode)).id
      response = await addLineItem(cartId).catch(medusaError)
    } else {
      const cart = await getOrSetCart(countryCode)
      response = await addLineItem(cart.id).catch(medusaError)
    }
  }

  await revalidateCartCache()

  return { totalItems: countCartItems(response.cart) }
}

export async function addManyToCart({
  items,
  countryCode,
}: {
  items: Array<{ variantId: string; quantity?: number }>
  countryCode: string
}): Promise<{ totalItems: number }> {
  const validItems = items.filter((item) => item.variantId)
  if (!validItems.length) {
    throw new Error("No items to add")
  }

  const [headers, cartIdFromCookie] = await Promise.all([
    getAuthHeaders(),
    getCartId(),
  ])

  let cartId = cartIdFromCookie
  if (!cartId) {
    cartId = (await getOrSetCart(countryCode)).id
  }

  const addLineItem = (id: string, variantId: string, quantity: number) =>
    sdk.store.cart.createLineItem(
      id,
      { variant_id: variantId, quantity },
      { fields: "*items" },
      headers
    )

  let response: { cart: HttpTypes.StoreCart } | null = null

  for (const item of validItems) {
    const quantity = item.quantity ?? 1
    try {
      response = await addLineItem(cartId, item.variantId, quantity)
    } catch (error) {
      if (isCartAlreadyCompletedError(error)) {
        await discardStaleCartCookie()
        cartId = (await getOrSetCart(countryCode)).id
        response = await addLineItem(cartId, item.variantId, quantity).catch(
          medusaError
        )
      } else {
        const cart = await getOrSetCart(countryCode)
        cartId = cart.id
        response = await addLineItem(cartId, item.variantId, quantity).catch(
          medusaError
        )
      }
    }
  }

  await revalidateCartCache()

  return { totalItems: countCartItems(response?.cart) }
}

export type BulkAddSkipReason = "multi_variant" | "unavailable"

export type BulkAddResult = {
  added: string[]
  usedDefaultVariant: string[]
  skipped: { productId: string; title: string; reason: BulkAddSkipReason }[]
}

export async function addProductsToCart({
  productIds,
  countryCode,
}: {
  productIds: string[]
  countryCode: string
}): Promise<BulkAddResult> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))]
  if (!uniqueIds.length) {
    return { added: [], usedDefaultVariant: [], skipped: [] }
  }

  const region = await getRegion(countryCode)
  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  await getOrSetCart(countryCode)

  const { response } = await listProducts({
    queryParams: {
      id: uniqueIds,
      limit: uniqueIds.length,
      fields:
        "id,title,*variants,+variants.inventory_quantity,*variants.calculated_price",
    },
    regionId: region.id,
  })

  const added: string[] = []
  const usedDefaultVariant: string[] = []
  const skipped: BulkAddResult["skipped"] = []
  const foundIds = new Set<string>()

  for (const product of response.products) {
    if (!product.id) continue
    foundIds.add(product.id)

    const variantId = getCartVariantId(product)

    if (!variantId) {
      skipped.push({
        productId: product.id,
        title: product.title ?? "Product",
        reason: "unavailable",
      })
      continue
    }

    try {
      await addToCart({ variantId, quantity: 1, countryCode })
      added.push(product.id)
      if (productNeedsVariantSelection(product)) {
        usedDefaultVariant.push(product.id)
      }
    } catch {
      skipped.push({
        productId: product.id,
        title: product.title ?? "Product",
        reason: "unavailable",
      })
    }
  }

  for (const productId of uniqueIds) {
    if (!foundIds.has(productId)) {
      skipped.push({
        productId,
        title: "Product",
        reason: "unavailable",
      })
    }
  }

  return { added, usedDefaultVariant, skipped }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}): Promise<{ totalItems: number }> {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.store.cart
    .updateLineItem(
      cartId,
      lineId,
      { quantity },
      { fields: "*items" },
      headers
    )
    .catch((error) => {
      if (isCartAlreadyCompletedError(error)) {
        return null
      }
      return medusaError(error)
    })

  if (!response) {
    await discardStaleCartCookie()
    return { totalItems: 0 }
  }

  await revalidateCartCache()

  return { totalItems: countCartItems(response.cart) }
}

export async function deleteLineItem(
  lineId: string
): Promise<{ totalItems: number }> {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.store.cart
    .deleteLineItem(cartId, lineId, { fields: "*items" }, headers)
    .catch((error) => {
      if (isCartAlreadyCompletedError(error)) {
        return null
      }
      return medusaError(error)
    })

  if (!response) {
    await discardStaleCartCookie()
    return { totalItems: 0 }
  }

  await revalidateCartCache()

  return { totalItems: countCartItems(response.parent) }
}

/** Drop the current cart cookie and create a fresh empty cart. */
export async function resetCart(countryCode: string) {
  await discardStaleCartCookie()
  await getOrSetCart(countryCode)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      await revalidateCartCache()
      return resp
    })
    .catch(medusaError)
}

export async function prepareCartRazorpayPayment(
  cartId: string
): Promise<string | null> {
  logCartPayment("server", "prepareCartRazorpayPayment:start", { cartId })

  try {
    const cart = await retrieveCart(
      cartId,
      "id,email,metadata,*shipping_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions",
      { noCache: true }
    )

    if (!cart) {
      throw new Error("Cart not found")
    }

    const hasPendingSession = cart.payment_collection?.payment_sessions?.some(
      (session) => session.status === "pending"
    )
    const alreadyPrepared =
      Boolean(cart.email) &&
      Boolean(cart.shipping_address?.address_1) &&
      Boolean(cart.shipping_methods?.length) &&
      cart.metadata?.wt_payment === "razorpay" &&
      Boolean(hasPendingSession)

    logCartPayment("server", "prepareCartRazorpayPayment:cart loaded", {
      cartId: cart.id,
      email: cart.email ?? null,
      hasAddress: Boolean(cart.shipping_address?.address_1),
      shippingMethodCount: cart.shipping_methods?.length ?? 0,
      paymentCollectionId: cart.payment_collection?.id ?? null,
      sessionCount: cart.payment_collection?.payment_sessions?.length ?? 0,
      wtPayment: cart.metadata?.wt_payment ?? null,
      alreadyPrepared,
    })

    if (!cart.email) {
      throw new Error("Add your email before paying")
    }

    if (!cart.shipping_address?.address_1) {
      throw new Error("Add a delivery address before paying")
    }

    if (!cart.shipping_methods?.length) {
      throw new Error("Select a delivery method before paying")
    }

    if (alreadyPrepared) {
      logCartPayment("server", "prepareCartRazorpayPayment:already ready — skip")
      return null
    }

    let paymentCart = cart

    if (cart.metadata?.wt_payment !== "razorpay") {
      paymentCart =
        (await updateCart({
          metadata: {
            ...(cart.metadata ?? {}),
            wt_payment: "razorpay",
          },
        })) ?? cart
      logCartPayment("server", "prepareCartRazorpayPayment:metadata updated")
    }

    const session = await initiatePaymentSession(paymentCart, {
      provider_id: "pp_system_default",
    })

    logCartPayment("server", "prepareCartRazorpayPayment:success", {
      cartId,
      paymentCollectionId: paymentCart.payment_collection?.id ?? null,
      sessionProviderId: session?.payment_collection?.payment_sessions?.at(-1)
        ?.provider_id,
    })

    return null
  } catch (e: any) {
    const message = e?.message ?? "Could not prepare Razorpay checkout"
    logCartPayment("server", "prepareCartRazorpayPayment:failed", {
      cartId,
      error: message,
    })
    return message
  }
}

export type CompleteRazorpayOrderInput = {
  cartId: string
  razorpay_order_id: string
  razorpay_payment_id: string
}

export type CompleteRazorpayOrderResult = {
  orderId: string
  countryCode: string
}

async function recoverCompletedCartOrder(
  cartId: string,
  razorpayPaymentId?: string
): Promise<CompleteRazorpayOrderResult | null> {
  await discardStaleCartCookie()

  if (razorpayPaymentId) {
    const order = await findOrderByRazorpayPaymentId(razorpayPaymentId)
    if (order) {
      return {
        orderId: order.id,
        countryCode:
          order.shipping_address?.country_code?.toLowerCase() ?? "in",
      }
    }
  }

  logCartPayment("server", "recoverCompletedCartOrder:no-order", { cartId })
  return null
}

/**
 * After Razorpay Standard Checkout succeeds: sync payment session to current cart
 * totals, complete the cart, clear the cookie, and return order info for client redirect.
 */
export async function completeRazorpayOrder(
  input: CompleteRazorpayOrderInput
): Promise<CompleteRazorpayOrderResult> {
  logCartPayment("server", "completeRazorpayOrder:start", {
    cartId: input.cartId,
    razorpay_order_id: input.razorpay_order_id,
    razorpay_payment_id: input.razorpay_payment_id,
  })

  const headers = {
    ...(await getAuthHeaders()),
  }

  // Payment callback must work even if the cart cookie was cleared mid-checkout.
  await setCartId(input.cartId)

  let cart = await retrieveCart(
    input.cartId,
    "id,email,completed_at,metadata,*shipping_address,*shipping_methods,*payment_collection,*payment_collection.payment_sessions",
    { noCache: true }
  )

  if (!cart) {
    const recovered = await recoverCompletedCartOrder(
      input.cartId,
      input.razorpay_payment_id
    )
    if (recovered) {
      return recovered
    }
    throw new Error("Cart not found")
  }

  if (isCartCompleted(cart)) {
    const recovered = await recoverCompletedCartOrder(
      input.cartId,
      input.razorpay_payment_id
    )
    if (recovered) {
      logCartPayment("server", "completeRazorpayOrder:recovered-existing-order", {
        cartId: input.cartId,
        orderId: recovered.orderId,
      })
      return recovered
    }

    throw new Error(
      "This order was already placed. Your cart has been cleared — you can start a new order."
    )
  }

  if (!cart.email) {
    throw new Error("Add your email before paying")
  }

  if (!cart.shipping_address?.address_1) {
    throw new Error("Add a delivery address before paying")
  }

  if (!cart.shipping_methods?.length) {
    throw new Error("Select a delivery method before paying")
  }

  cart =
    (await updateCart(
      {
        metadata: {
          ...(cart.metadata ?? {}),
          wt_payment: "razorpay",
          razorpay_order_id: input.razorpay_order_id,
          razorpay_payment_id: input.razorpay_payment_id,
        },
      },
      { cartId: input.cartId, revalidateFulfillment: false }
    )) ?? cart

  const hasPendingPaymentSession = cart.payment_collection?.payment_sessions?.some(
    (session) => session.status === "pending"
  )

  // Payment session is created on the delivery step — skip a slow re-initiate after Razorpay succeeds.
  if (!hasPendingPaymentSession) {
    await initiatePaymentSession(cart, {
      provider_id: "pp_system_default",
    })
  } else {
    logCartPayment("server", "completeRazorpayOrder:skip-initiate — pending session exists")
  }

  let cartRes: Awaited<ReturnType<typeof sdk.store.cart.complete>> | null = null

  try {
    cartRes = await sdk.store.cart.complete(input.cartId, {}, headers)
    await revalidateCartCache()
  } catch (error) {
    if (isCartAlreadyCompletedError(error)) {
      const recovered = await recoverCompletedCartOrder(
        input.cartId,
        input.razorpay_payment_id
      )
      if (recovered) {
        logCartPayment("server", "completeRazorpayOrder:recovered-after-complete-error", {
          cartId: input.cartId,
          orderId: recovered.orderId,
        })
        return recovered
      }

      throw new Error(
        "Payment received and this cart was already completed. Your cart has been cleared — check your email for order confirmation."
      )
    }

    medusaError(error)
  }

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase() ?? "in"

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    await removeCartId()

    logCartPayment("server", "completeRazorpayOrder:success", {
      cartId: input.cartId,
      orderId: cartRes.order.id,
      countryCode,
    })

    return {
      orderId: cartRes.order.id,
      countryCode,
    }
  }

  const message =
    cartRes?.type === "cart"
      ? cartRes.error?.message ?? "Could not place order"
      : "Could not place order"

  logCartPayment("server", "completeRazorpayOrder:failed", {
    cartId: input.cartId,
    error: message,
    responseType: cartRes?.type,
  })

  throw new Error(message)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(medusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
function buildAddressPayload(formData: FormData) {
  const data = {
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      address_2: formData.get("shipping_address.address_2") || "",
      company: formData.get("shipping_address.company"),
      postal_code: formData.get("shipping_address.postal_code"),
      city: formData.get("shipping_address.city"),
      country_code: formData.get("shipping_address.country_code"),
      province: formData.get("shipping_address.province"),
      phone: formData.get("shipping_address.phone"),
    },
    email: formData.get("email"),
  } as HttpTypes.StoreUpdateCart

  const sameAsBilling = formData.get("same_as_billing")
  if (sameAsBilling === "on" || sameAsBilling === "true") {
    data.billing_address = data.shipping_address
  } else {
    data.billing_address = {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      address_1: formData.get("billing_address.address_1"),
      address_2: formData.get("billing_address.address_2") || "",
      company: formData.get("billing_address.company"),
      postal_code: formData.get("billing_address.postal_code"),
      city: formData.get("billing_address.city"),
      country_code: formData.get("billing_address.country_code"),
      province: formData.get("billing_address.province"),
      phone: formData.get("billing_address.phone"),
    }
  }

  return data
}

export async function applyCartAddress({
  shippingAddress,
  email,
}: {
  shippingAddress: NonNullable<HttpTypes.StoreUpdateCart["shipping_address"]>
  email: string
}): Promise<string | null> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return "Add your email before continuing"
  }

  try {
    await updateCart(
      {
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        email: trimmedEmail,
      },
      { revalidateFulfillment: false }
    )
    return null
  } catch (e: any) {
    return e.message
  }
}

export async function saveCartEmail(email: string): Promise<string | null> {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) {
    return "Email is required"
  }

  try {
    await updateCart({ email: trimmedEmail }, { revalidateFulfillment: false })
    return null
  } catch (e: any) {
    return e.message
  }
}

export async function saveCartAddresses(
  _currentState: unknown,
  formData: FormData
): Promise<string | null> {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }

    const cartId = await getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = buildAddressPayload(formData)
    const email = String(data.email ?? "").trim()
    if (!email) {
      throw new Error("Add your email before continuing")
    }
    data.email = email

    await updateCart(data, { revalidateFulfillment: false })

    const saveAddress =
      formData.get("save_address") === "on" ||
      formData.get("save_address") === "true"
    const headers = await getAuthHeaders()

    if (saveAddress && "authorization" in headers && data.shipping_address) {
      await sdk.store.customer.createAddress(
        {
          first_name: data.shipping_address.first_name as string,
          last_name: data.shipping_address.last_name as string,
          company: (data.shipping_address.company as string) || undefined,
          address_1: data.shipping_address.address_1 as string,
          address_2: (data.shipping_address.address_2 as string) || undefined,
          city: data.shipping_address.city as string,
          postal_code: data.shipping_address.postal_code as string,
          province: (data.shipping_address.province as string) || undefined,
          country_code: data.shipping_address.country_code as string,
          phone: (data.shipping_address.phone as string) || undefined,
          is_default_shipping: true,
        },
        {},
        headers
      )

      const customerCacheTag = await getCacheTag("customers")
      if (customerCacheTag) {
        revalidateTag(customerCacheTag)
      }
    }

    return null
  } catch (e: any) {
    return e.message
  }
}

export async function setAddresses(currentState: unknown, formData: FormData) {
  const message = await saveCartAddresses(currentState, formData)
  if (message) {
    return message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`
  )
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode =
      cartRes.order.shipping_address?.country_code?.toLowerCase()

    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    await removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  if (cartRes?.type === "cart") {
    throw new Error(cartRes.error?.message ?? "Could not place order")
  }

  throw new Error("Could not place order")
}

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart({ region_id: region.id })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("shippingOptions")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next,
    headers,
    cache: "force-cache",
  })
}
