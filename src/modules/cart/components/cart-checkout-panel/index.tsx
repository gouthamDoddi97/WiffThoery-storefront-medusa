"use client"

import {
  applyCartAddress,
  prepareCartRazorpayPayment,
  saveCartAddresses,
  saveCartEmail,
  setShippingMethod,
} from "@lib/data/cart"
import { isRazorpayConfigured } from "@lib/razorpay/config"
import { checkPincodeServiceability, type PincodeCheck } from "@lib/data/shipping"
import { logCartPayment } from "@lib/debug/cart-payment"
import { convertToLocale } from "@lib/util/money"
import { normalizeInrShippingAmount } from "@lib/util/medusa-amount"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { RazorpayPaymentButton } from "@modules/checkout/components/payment-button/razorpay-payment-button"
import CountrySelect from "@modules/checkout/components/country-select"
import CartTotals from "@modules/common/components/cart-totals"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import PriceText from "@modules/common/components/price-text"
import RazorpayMethodIcons from "@modules/common/components/razorpay-method-icons"
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"

type CheckoutStep = "address" | "delivery" | "payment"

const CHECKOUT_STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "address", label: "01 ADDRESS" },
  { id: "delivery", label: "02 DELIVERY" },
  { id: "payment", label: "03 PAYMENT" },
]

const PANEL_BORDER =
  "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 22%, transparent)"

function getDefaultStep(cart: HttpTypes.StoreCart): CheckoutStep {
  if (!cart.shipping_address?.address_1) return "address"
  if (!cart.shipping_methods?.length) return "delivery"
  return "payment"
}

function stepIsComplete(cart: HttpTypes.StoreCart, step: CheckoutStep) {
  if (step === "address") {
    return Boolean(cart.shipping_address?.address_1)
  }
  if (step === "delivery") {
    return Boolean(cart.shipping_methods?.length)
  }
  return Boolean(
    cart.payment_collection?.payment_sessions?.some((s) => s.status === "pending")
  )
}

async function prepareRazorpayCheckout(cartId: string) {
  return prepareCartRazorpayPayment(cartId)
}

type CartCheckoutPanelProps = {
  cart: HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] }
  customer: HttpTypes.StoreCustomer | null
  shippingMethods: HttpTypes.StoreCartShippingOption[]
  paymentMethods: { id: string }[]
}

export default function CartCheckoutPanel({
  cart,
  customer,
  shippingMethods,
}: CartCheckoutPanelProps) {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState<CheckoutStep>(() =>
    getDefaultStep(cart)
  )
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved")
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [applyingAddress, setApplyingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [paymentPreparing, setPaymentPreparing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [checkoutEmail, setCheckoutEmail] = useState(
    () => cart.email ?? customer?.email ?? ""
  )
  /** Optimistic email after save — page cart can lag behind Medusa until cache refreshes. */
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(
    () => cart.email ?? null
  )
  const [razorpaySelected, setRazorpaySelected] = useState(true)
  const [saveAddress, setSaveAddress] = useState(true)
  const [pincodeCheck, setPincodeCheck] = useState<PincodeCheck | null>(null)
  const [pincodeChecking, setPincodeChecking] = useState(false)
  const addressSubmitStarted = useRef(false)
  const paymentAutoPrepared = useRef(false)

  const [message, formAction, isSavingAddress] = useActionState(
    saveCartAddresses,
    null
  )

  const countriesInRegion = useMemo(
    () => cart.region?.countries?.map((c) => c.iso_2) ?? [],
    [cart.region]
  )

  const savedAddresses = useMemo(
    () =>
      customer?.addresses.filter(
        (address) =>
          address.country_code && countriesInRegion.includes(address.country_code)
      ) ?? [],
    [customer?.addresses, countriesInRegion]
  )

  const deliveryMethods = useMemo(
    () =>
      shippingMethods.filter(
        (method) => method.service_zone?.fulfillment_set?.type !== "pickup"
      ),
    [shippingMethods]
  )

  const selectedShippingId =
    cart.shipping_methods?.at(-1)?.shipping_option_id ?? null

  const [formData, setFormData] = useState(() => ({
    "shipping_address.first_name": cart.shipping_address?.first_name ?? "",
    "shipping_address.last_name": cart.shipping_address?.last_name ?? "",
    "shipping_address.address_1": cart.shipping_address?.address_1 ?? "",
    "shipping_address.company": cart.shipping_address?.company ?? "",
    "shipping_address.postal_code": cart.shipping_address?.postal_code ?? "",
    "shipping_address.city": cart.shipping_address?.city ?? "",
    "shipping_address.country_code":
      cart.shipping_address?.country_code ??
      countriesInRegion[0] ??
      "",
    "shipping_address.province": cart.shipping_address?.province ?? "",
    "shipping_address.phone": cart.shipping_address?.phone ?? "",
    email: cart.email ?? customer?.email ?? "",
  }))

  useEffect(() => {
    setCheckoutEmail(cart.email ?? customer?.email ?? "")
    if (cart.email) {
      setConfirmedEmail(cart.email)
    }
  }, [cart.email, customer?.email])

  const effectiveEmail = cart.email || confirmedEmail || null

  const selectedSavedAddress = savedAddresses.find(
    (address) => address.id === selectedAddressId
  )
  const usingSavedAddress = addressMode === "saved" && savedAddresses.length > 0
  const activePincode = usingSavedAddress
    ? selectedSavedAddress?.postal_code ?? ""
    : formData["shipping_address.postal_code"]
  const activeCountry = usingSavedAddress
    ? selectedSavedAddress?.country_code ?? ""
    : formData["shipping_address.country_code"]

  useEffect(() => {
    const pin = (activePincode ?? "").trim()
    if (activeCountry !== "in" || !/^\d{6}$/.test(pin)) {
      setPincodeCheck(null)
      setPincodeChecking(false)
      return
    }

    let cancelled = false
    setPincodeChecking(true)
    setPincodeCheck(null)

    const timer = setTimeout(() => {
      void checkPincodeServiceability(pin)
        .then((result) => {
          if (!cancelled) setPincodeCheck(result)
        })
        .finally(() => {
          if (!cancelled) setPincodeChecking(false)
        })
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [activePincode, activeCountry])

  useEffect(() => {
    if (savedAddresses.length) {
      setAddressMode("saved")
      setSelectedAddressId((current) => current ?? savedAddresses[0]?.id ?? null)
    } else {
      setAddressMode("new")
    }
  }, [savedAddresses])

  useEffect(() => {
    if (isSavingAddress) {
      addressSubmitStarted.current = true
      return
    }

    if (!addressSubmitStarted.current) return

    addressSubmitStarted.current = false
    if (message === null) {
      router.refresh()
      setActiveStep("delivery")
    }
  }, [isSavingAddress, message, router])

  useEffect(() => {
    if (activeStep !== "payment") {
      paymentAutoPrepared.current = false
    }
  }, [activeStep])

  useEffect(() => {
    if (activeStep !== "delivery" || !deliveryMethods.length) return
    if (selectedShippingId) return

    const firstMethod = deliveryMethods[0]
    if (!firstMethod?.id) return

    setShippingLoading(true)
    void setShippingMethod({ cartId: cart.id, shippingMethodId: firstMethod.id })
      .then(() => {
        router.refresh()
        if (deliveryMethods.length === 1) {
          setActiveStep("payment")
        }
      })
      .catch((err) => setShippingError(err.message))
      .finally(() => setShippingLoading(false))
  }, [activeStep, deliveryMethods, selectedShippingId, cart.id, router])

  const ensureRazorpayReady = async () => {
    logCartPayment("panel", "ensureRazorpayReady:start", {
      cartId: cart.id,
      effectiveEmail,
    })

    if (!isRazorpayConfigured()) {
      logCartPayment("panel", "ensureRazorpayReady:blocked — Razorpay not configured")
      setPaymentError(
        "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local and restart the dev server."
      )
      return false
    }

    if (!effectiveEmail) {
      logCartPayment("panel", "ensureRazorpayReady:blocked — no email")
      setPaymentError("Add your email before paying.")
      return false
    }

    const hasSession = cart.payment_collection?.payment_sessions?.some(
      (session) => session.status === "pending"
    )
    if (hasSession && cart.metadata?.wt_payment === "razorpay") {
      logCartPayment("panel", "ensureRazorpayReady:already ready — skip network")
      paymentAutoPrepared.current = true
      return true
    }

    if (paymentPreparing) {
      return false
    }

    setPaymentPreparing(true)
    setPaymentError(null)

    const error = await prepareRazorpayCheckout(cart.id)
    setPaymentPreparing(false)

    if (error) {
      logCartPayment("panel", "ensureRazorpayReady:failed", { error })
      setPaymentError(error)
      paymentAutoPrepared.current = false
      return false
    }

    paymentAutoPrepared.current = true
    logCartPayment("panel", "ensureRazorpayReady:success — refreshing cart")
    router.refresh()
    return true
  }

  useEffect(() => {
    if (activeStep !== "payment") return

    if (!isRazorpayConfigured()) {
      logCartPayment("panel", "auto-prepare:blocked — Razorpay not configured")
      setPaymentError(
        "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local and restart the dev server."
      )
      return
    }

    if (!razorpaySelected || paymentAutoPrepared.current || paymentPreparing) {
      return
    }

    if (!effectiveEmail) {
      logCartPayment("panel", "auto-prepare:waiting for email")
      return
    }

    const hasSession = cart.payment_collection?.payment_sessions?.some(
      (session) => session.status === "pending"
    )
    if (hasSession && cart.metadata?.wt_payment === "razorpay") {
      logCartPayment("panel", "auto-prepare:skipped — session already pending", {
        paymentCollectionId: cart.payment_collection?.id,
        sessionCount: cart.payment_collection?.payment_sessions?.length ?? 0,
      })
      paymentAutoPrepared.current = true
      return
    }

    logCartPayment("panel", "auto-prepare:starting")
    paymentAutoPrepared.current = true
    void ensureRazorpayReady()
  }, [
    activeStep,
    razorpaySelected,
    effectiveEmail,
    paymentPreparing,
    cart.metadata?.wt_payment,
    cart.payment_collection?.payment_sessions,
  ])

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleApplySavedAddress = async () => {
    const saved = savedAddresses.find((address) => address.id === selectedAddressId)
    if (!saved) return

    const email = (checkoutEmail || customer?.email || cart.email || "").trim()
    if (!email) {
      setAddressError("Add your email before continuing.")
      return
    }

    setApplyingAddress(true)
    setAddressError(null)

    const error = await applyCartAddress({
      shippingAddress: {
        first_name: saved.first_name ?? undefined,
        last_name: saved.last_name ?? undefined,
        address_1: saved.address_1 ?? undefined,
        address_2: saved.address_2 ?? undefined,
        company: saved.company ?? undefined,
        postal_code: saved.postal_code ?? undefined,
        city: saved.city ?? undefined,
        province: saved.province ?? undefined,
        country_code: saved.country_code ?? undefined,
        phone: saved.phone ?? undefined,
      },
      email,
    })

    setApplyingAddress(false)

    if (error) {
      setAddressError(error)
      return
    }

    router.refresh()
    setActiveStep("delivery")
  }

  const handleShippingSelect = async (methodId: string) => {
    if (methodId === selectedShippingId) {
      setActiveStep("payment")
      return
    }

    setShippingLoading(true)
    setShippingError(null)

    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: methodId })
      router.refresh()
      setActiveStep("payment")
    } catch (err: unknown) {
      setShippingError(err instanceof Error ? err.message : "Could not set shipping")
    } finally {
      setShippingLoading(false)
    }
  }

  const handleSaveEmail = async () => {
    setEmailSaving(true)
    setEmailError(null)

    const trimmed = checkoutEmail.trim()
    const error = await saveCartEmail(trimmed)
    setEmailSaving(false)

    if (error) {
      setEmailError(error)
      return
    }

    setConfirmedEmail(trimmed)
    paymentAutoPrepared.current = false
    router.refresh()
  }

  const canPay =
    Boolean(cart.shipping_address?.address_1) &&
    Boolean(effectiveEmail) &&
    Boolean(cart.shipping_methods?.length) &&
    razorpaySelected &&
    isRazorpayConfigured()

  const notReady = !canPay

  useEffect(() => {
    if (activeStep !== "payment") return

    logCartPayment("panel", "payment-step state", {
      cartId: cart.id,
      canPay,
      notReady,
      hasAddress: Boolean(cart.shipping_address?.address_1),
      hasEmail: Boolean(effectiveEmail),
      cartEmail: cart.email ?? null,
      confirmedEmail,
      shippingMethodCount: cart.shipping_methods?.length ?? 0,
      razorpaySelected,
      razorpayConfigured: isRazorpayConfigured(),
      paymentPreparing,
      paymentSessions:
        cart.payment_collection?.payment_sessions?.map((s) => ({
          id: s.id,
          status: s.status,
          provider_id: s.provider_id,
        })) ?? [],
      wtPayment: cart.metadata?.wt_payment,
      itemTotal: cart.item_total,
      shippingTotal: cart.shipping_total,
      cartTotal: cart.total,
    })
  }, [
    activeStep,
    canPay,
    notReady,
    cart.id,
    cart.email,
    confirmedEmail,
    effectiveEmail,
    cart.shipping_address?.address_1,
    cart.shipping_methods?.length,
    cart.payment_collection?.payment_sessions,
    cart.metadata?.wt_payment,
    cart.item_total,
    cart.shipping_total,
    cart.total,
    razorpaySelected,
    paymentPreparing,
  ])

  const pincodeStatus = pincodeChecking ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
      Checking delivery availability…
    </p>
  ) : pincodeCheck?.serviceable === true ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface">
      ✓{" "}
      {pincodeCheck.min_days
        ? `Delivers to ${activePincode} in ${
            pincodeCheck.min_days === pincodeCheck.max_days
              ? pincodeCheck.min_days
              : `${pincodeCheck.min_days}–${pincodeCheck.max_days}`
          } days`
        : `Delivery available to ${activePincode}`}
    </p>
  ) : pincodeCheck?.serviceable === false ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-red-500">
      Delivery is currently unavailable to {activePincode}
    </p>
  ) : null

  return (
    <div
      className="flex flex-col gap-6 p-6 small:p-8 bg-surface-low"
      style={{ border: PANEL_BORDER }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
        {CHECKOUT_STEPS.map((checkoutStep, index) => {
          const canOpen =
            checkoutStep.id === "address" ||
            (checkoutStep.id === "delivery" && stepIsComplete(cart, "address")) ||
            (checkoutStep.id === "payment" &&
              stepIsComplete(cart, "address") &&
              stepIsComplete(cart, "delivery"))

          return (
            <span key={checkoutStep.id} className="inline-flex items-center gap-3">
              <button
                type="button"
                disabled={!canOpen}
                onClick={() => canOpen && setActiveStep(checkoutStep.id)}
                className={clx(
                  "transition-colors disabled:cursor-default",
                  activeStep === checkoutStep.id
                    ? "text-on-surface border-b border-on-surface pb-0.5"
                    : canOpen
                    ? "text-on-surface-muted hover:text-on-surface"
                    : "text-on-surface-disabled"
                )}
              >
                {checkoutStep.label}
              </button>
              {index < CHECKOUT_STEPS.length - 1 && (
                <span className="text-on-surface-disabled" aria-hidden>
                  ·
                </span>
              )}
            </span>
          )
        })}
      </div>

      <div className="min-h-[220px]">
        {activeStep === "address" && (
          <div className="flex flex-col gap-5">
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted">
                    Saved addresses
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddressMode(addressMode === "saved" ? "new" : "saved")}
                    className="font-mono text-[9px] tracking-[0.12em] uppercase text-primary hover:opacity-80"
                  >
                    {addressMode === "saved" ? "Add new" : "Use saved"}
                  </button>
                </div>

                {addressMode === "saved" && (
                  <div className="flex flex-col gap-2">
                    {savedAddresses.map((address) => {
                      const selected = selectedAddressId === address.id
                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setSelectedAddressId(address.id)}
                          className={clx(
                            "text-left p-4 transition-colors",
                            selected
                              ? "bg-surface-container/60"
                              : "bg-transparent hover:bg-surface-container/30"
                          )}
                          style={{ border: PANEL_BORDER }}
                        >
                          <p className="font-garamond text-base text-on-surface">
                            {address.first_name} {address.last_name}
                          </p>
                          <p className="mt-1 font-mono text-[9px] tracking-[0.1em] uppercase text-on-surface-muted leading-relaxed">
                            {address.address_1}
                            {address.address_2 ? `, ${address.address_2}` : ""} ·{" "}
                            {address.postal_code} {address.city}
                          </p>
                        </button>
                      )
                    })}

                    {pincodeStatus}

                    <Input
                      label="Email"
                      name="saved_checkout_email"
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => void handleApplySavedAddress()}
                      disabled={!selectedAddressId || applyingAddress}
                      className="w-full py-3.5 mt-1 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase disabled:opacity-50"
                    >
                      {applyingAddress ? "Saving…" : "Continue to delivery →"}
                    </button>
                    <ErrorMessage error={addressError} />
                  </div>
                )}
              </div>
            )}

            {(addressMode === "new" || !savedAddresses.length) && (
              <form action={formAction} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First name"
                      name="shipping_address.first_name"
                      value={formData["shipping_address.first_name"]}
                      onChange={handleFormChange}
                      required
                    />
                    <Input
                      label="Last name"
                      name="shipping_address.last_name"
                      value={formData["shipping_address.last_name"]}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <Input
                    label="Address"
                    name="shipping_address.address_1"
                    value={formData["shipping_address.address_1"]}
                    onChange={handleFormChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Postal code"
                      name="shipping_address.postal_code"
                      value={formData["shipping_address.postal_code"]}
                      onChange={handleFormChange}
                      required
                    />
                    <Input
                      label="City"
                      name="shipping_address.city"
                      value={formData["shipping_address.city"]}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  {pincodeStatus}
                  <CountrySelect
                    name="shipping_address.country_code"
                    region={cart.region}
                    value={formData["shipping_address.country_code"]}
                    onChange={handleFormChange}
                    required
                  />
                  <Input
                    label="State / Province"
                    name="shipping_address.province"
                    value={formData["shipping_address.province"]}
                    onChange={handleFormChange}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                  <Input
                    label="Phone"
                    name="shipping_address.phone"
                    value={formData["shipping_address.phone"]}
                    onChange={handleFormChange}
                  />
                </div>

                <input type="hidden" name="same_as_billing" value="true" />

                {customer && (
                  <>
                    <Checkbox
                      label="Save this address for next time"
                      name="save_address"
                      checked={saveAddress}
                      onChange={() => setSaveAddress((prev) => !prev)}
                    />
                    {saveAddress && (
                      <input type="hidden" name="save_address" value="true" />
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-full py-3.5 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase disabled:opacity-50"
                >
                  {isSavingAddress ? "Saving…" : "Continue to delivery →"}
                </button>
                <ErrorMessage error={message} />
              </form>
            )}
          </div>
        )}

        {activeStep === "delivery" && (
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted">
              Delivery method
            </p>

            {deliveryMethods.length ? (
              <div className="flex flex-col gap-2">
                {deliveryMethods.map((method) => {
                  const selected = selectedShippingId === method.id
                  const calculatedAmount = (
                    method as HttpTypes.StoreCartShippingOption & {
                      calculated_price?: { calculated_amount?: number | null }
                    }
                  ).calculated_price?.calculated_amount
                  const rawAmount =
                    (selected ? cart.shipping_total : null) ??
                    calculatedAmount ??
                    method.amount ??
                    cart.shipping_methods?.find((m) => m.shipping_option_id === method.id)
                      ?.amount ??
                    0
                  const amount = normalizeInrShippingAmount(
                    rawAmount ?? 0,
                    cart.item_total ?? 0,
                    cart.currency_code
                  )

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => void handleShippingSelect(method.id)}
                      disabled={shippingLoading}
                      className={clx(
                        "flex items-center justify-between gap-4 p-4 text-left transition-colors disabled:opacity-60",
                        selected
                          ? "bg-surface-container/60"
                          : "bg-transparent hover:bg-surface-container/30"
                      )}
                      style={{ border: PANEL_BORDER }}
                    >
                      <div>
                        <p className="font-garamond text-base text-on-surface">
                          {method.name}
                        </p>
                        <p className="mt-1 font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                          Standard delivery
                        </p>
                      </div>
                      <span className="font-mono text-sm text-on-surface whitespace-nowrap">
                        <PriceText>
                          {convertToLocale({
                            amount,
                            currency_code: cart.currency_code,
                          })}
                        </PriceText>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="font-inter text-sm text-on-surface-variant">
                No delivery methods available for this address.
              </p>
            )}

            {shippingLoading && (
              <div className="flex items-center gap-2 text-on-surface-muted">
                <Spinner />
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase">
                  Updating delivery…
                </span>
              </div>
            )}

            {selectedShippingId && !shippingLoading && (
              <button
                type="button"
                onClick={() => setActiveStep("payment")}
                className="w-full py-3.5 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase"
              >
                Continue to payment →
              </button>
            )}

            <ErrorMessage error={shippingError} />
          </div>
        )}

        {activeStep === "payment" && (
          <div className="flex flex-col gap-4">
            {!effectiveEmail && (
              <div
                className="flex flex-col gap-3 p-4"
                style={{ border: PANEL_BORDER }}
              >
                <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted">
                  Add your email to pay
                </p>
                <Input
                  label="Email"
                  name="payment_checkout_email"
                  type="email"
                  value={checkoutEmail}
                  onChange={(e) => setCheckoutEmail(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => void handleSaveEmail()}
                  disabled={emailSaving || !checkoutEmail.trim()}
                  className="w-full py-3.5 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase disabled:opacity-50"
                >
                  {emailSaving ? "Saving…" : "Save email →"}
                </button>
                <ErrorMessage error={emailError} />
              </div>
            )}

            <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted">
              Payment method
            </p>

            <button
              type="button"
              onClick={() => {
                setRazorpaySelected(true)
                void ensureRazorpayReady()
              }}
              className={clx(
                "w-full p-4 text-left transition-colors",
                razorpaySelected
                  ? "bg-surface-container/60"
                  : "bg-transparent hover:bg-surface-container/30"
              )}
              style={{ border: PANEL_BORDER }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={clx(
                      "mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center",
                      razorpaySelected
                        ? "border-on-surface bg-on-surface"
                        : "border-on-surface-muted"
                    )}
                    aria-hidden
                  >
                    {razorpaySelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-lowest" />
                    )}
                  </span>
                  <div>
                    <p className="font-garamond text-lg text-on-surface">Razorpay</p>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted leading-relaxed">
                      UPI · Cards · Net banking · Wallets
                    </p>
                  </div>
                </div>
                {paymentPreparing && <Spinner />}
              </div>
              <RazorpayMethodIcons className="mt-4 ml-7" compact />
            </button>

            {paymentPreparing && (
              <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                Preparing secure checkout…
              </p>
            )}

            <ErrorMessage error={paymentError} />
          </div>
        )}
      </div>

      <CartTotals totals={cart} variant="checkout" />

      {activeStep === "payment" && (
        <RazorpayPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid="cart-checkout-pay-button"
          buttonLabel="PROCEED TO PAY →"
          buttonClassName="w-full py-4 px-6 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[11px] tracking-[0.22em] uppercase transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onBeforePay={ensureRazorpayReady}
        />
      )}

      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted text-center inline-flex items-center justify-center gap-2 w-full">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="1" />
          <path d="M8 11V8a4 4 0 118 0v3" />
        </svg>
        SECURE CHECKOUT · RAZORPAY
      </p>
    </div>
  )
}
