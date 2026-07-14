"use server"

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

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(
  cartId?: string,
  fields?: string,
  options?: { noCache?: boolean }
) {
  const id = cartId || (await getCartId())
  // `email` is a scalar — do not use `*email` (relation expand), or it is omitted.
  fields ??=
    "*items, *region, *shipping_address, *billing_address, email, *items.product, *items.product.metadata, *items.variant, *items.variant.product, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name, *payment_collection, *payment_collection.payment_sessions"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = options?.noCache
    ? undefined
    : {
        ...(await getCacheOptions("carts")),
      }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields,
      },
      headers,
      next,
      cache: options?.noCache ? "no-store" : "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

async function revalidateCartCache() {
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag("carts")
  if (cartCacheTag) {
    revalidateTag(cartCacheTag)
  }
}

export async function getOrSetCart(countryCode: string) {
  const [region, cartIdFromCookie] = await Promise.all([
    getRegion(countryCode),
    getCartId(),
  ])

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  let cart = cartIdFromCookie
    ? await retrieveCart(cartIdFromCookie, "id,region_id")
    : await retrieveCart(undefined, "id,region_id")

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

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

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

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

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
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  let cartId = await getCartId()

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
      {},
      headers
    )

  try {
    await addLineItem(cartId)
  } catch {
    const cart = await getOrSetCart(countryCode)
    await addLineItem(cart.id).catch(medusaError)
  }

  await revalidateCartCache()
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
}) {
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

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      await revalidateCartCache()
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
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

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      await revalidateCartCache()
    })
    .catch(medusaError)
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
      await revalidateCartCache()
      return null
    }

    if (cart.metadata?.wt_payment !== "razorpay") {
      await updateCart({
        metadata: {
          ...(cart.metadata ?? {}),
          wt_payment: "razorpay",
        },
      })
      logCartPayment("server", "prepareCartRazorpayPayment:metadata updated")
    }

    const freshCart = await retrieveCart(
      cartId,
      "id,metadata,*payment_collection,*payment_collection.payment_sessions",
      { noCache: true }
    )

    if (!freshCart) {
      throw new Error("Cart not found")
    }

    const session = await initiatePaymentSession(freshCart, {
      provider_id: "pp_system_default",
    })

    logCartPayment("server", "prepareCartRazorpayPayment:success", {
      cartId,
      paymentCollectionId: freshCart.payment_collection?.id ?? null,
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
      address_2: "",
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
      address_2: "",
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
    await updateCart({
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      email: trimmedEmail,
    })
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
    await updateCart({ email: trimmedEmail })
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

    await updateCart(data)

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

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
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
