"use client"

import {
  applyCartAddress,
  prepareCartRazorpayPayment,
  saveCartAddresses,
  saveCartEmail,
  setShippingMethod,
} from "@lib/data/cart"
import { isRazorpayConfigured } from "@lib/razorpay/config"
import { listShiprocketCouriers, selectShiprocketCourier, type ShiprocketCourierOption } from "@lib/data/shipping"
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
import RazorpayScriptPreloader from "@modules/common/components/razorpay-script-preloader"
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/navigation"
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react"

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
  const [shiprocketCouriers, setShiprocketCouriers] = useState<ShiprocketCourierOption[]>([])
  const [couriersLoading, setCouriersLoading] = useState(false)
  const [couriersError, setCouriersError] = useState<string | null>(null)
  const [shiprocketLive, setShiprocketLive] = useState(false)
  const addressSubmitStarted = useRef(false)
  const paymentAutoPrepared = useRef(false)
  const preparePromiseRef = useRef<Promise<boolean> | null>(null)
  const [addressConfirmed, setAddressConfirmed] = useState(() =>
    Boolean(cart.shipping_address?.address_1)
  )
  /** True after shipping/courier select succeeds — cart props may lag until refresh. */
  const [shippingConfirmed, setShippingConfirmed] = useState(() =>
    Boolean(cart.shipping_methods?.length)
  )
  /** Optimistic courier totals until cart refresh returns shiprocket metadata. */
  const [shippingOverride, setShippingOverride] = useState<{
    name: string
    amount: number
  } | null>(null)

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
    "shipping_address.address_2": cart.shipping_address?.address_2 ?? "",
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

  const shiprocketSelection = cart.metadata?.shiprocket as
    | { courier_company_id?: number; courier_name?: string }
    | undefined

  const deliveryPincode =
    cart.shipping_address?.postal_code?.trim() ||
    (activeCountry === "in" ? (activePincode ?? "").trim() : "")

  const useShiprocketDelivery = shiprocketCouriers.length > 0

  useEffect(() => {
    if (cart.shipping_address?.address_1) {
      setAddressConfirmed(true)
    }
  }, [cart.shipping_address?.address_1])

  useEffect(() => {
    if (cart.shipping_methods?.length) {
      setShippingConfirmed(true)
    }
    const sr = cart.metadata?.shiprocket as { courier_name?: string; rate_inr?: number } | undefined
    if (sr?.courier_name && sr.rate_inr != null) {
      setShippingOverride({
        name: `${sr.courier_name} via Shiprocket`,
        amount: sr.rate_inr,
      })
    }
  }, [cart.shipping_methods?.length, cart.metadata?.shiprocket])

  useEffect(() => {
    if (activeCountry !== "in" || !/^\d{6}$/.test(deliveryPincode)) {
      setShiprocketCouriers([])
      setCouriersError(null)
      return
    }

    let cancelled = false
    setCouriersLoading(true)
    setCouriersError(null)

    void listShiprocketCouriers(deliveryPincode, cart.id)
      .then((result) => {
        if (cancelled) return
        setShiprocketCouriers(result.couriers)
        setShiprocketLive(result.live)
        if (result.error && !result.couriers.length) {
          setCouriersError(result.error)
        }
      })
      .finally(() => {
        if (!cancelled) setCouriersLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    deliveryPincode,
    activeCountry,
    cart.id,
    cart.items?.map((item) => `${item.id}:${item.quantity}`).join(",") ?? "",
  ])

  const refreshCart = () => startTransition(() => router.refresh())

  const advanceToDelivery = () => {
    setAddressConfirmed(true)
    setActiveStep("delivery")
    refreshCart()
  }

  const advanceToPayment = () => {
    setShippingConfirmed(true)
    paymentAutoPrepared.current = false
    setActiveStep("payment")
    void ensureRazorpayReady({ silent: true })
    refreshCart()
  }

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
      advanceToDelivery()
    }
  }, [isSavingAddress, message])

  useEffect(() => {
    if (activeStep !== "payment") {
      paymentAutoPrepared.current = false
    }
  }, [activeStep])

  const expectShiprocketCouriers =
    activeCountry === "in" && /^\d{6}$/.test(deliveryPincode)

  useEffect(() => {
    if (activeStep !== "delivery" || !deliveryMethods.length) return
    // Wait for Shiprocket before falling back to flat-rate Medusa shipping.
    if (expectShiprocketCouriers) {
      if (couriersLoading) return
      if (useShiprocketDelivery) return
      if (!couriersError) return
    }
    if (selectedShippingId) return

    const firstMethod = deliveryMethods[0]
    if (!firstMethod?.id) return

    setShippingLoading(true)
    void setShippingMethod({ cartId: cart.id, shippingMethodId: firstMethod.id })
      .then(() => {
        setShippingConfirmed(true)
        refreshCart()
        if (deliveryMethods.length === 1) {
          paymentAutoPrepared.current = false
          setActiveStep("payment")
          void ensureRazorpayReady()
        }
      })
      .catch((err) => setShippingError(err.message))
      .finally(() => setShippingLoading(false))
  }, [
    activeStep,
    deliveryMethods,
    selectedShippingId,
    cart.id,
    expectShiprocketCouriers,
    couriersLoading,
    useShiprocketDelivery,
    couriersError,
  ])

  const handleCourierSelect = async (courier: ShiprocketCourierOption) => {
    if (courier.courier_company_id === shiprocketSelection?.courier_company_id) {
      advanceToPayment()
      return
    }

    setShippingError(null)
    setShippingOverride({
      name: `${courier.courier_name} via Shiprocket`,
      amount: courier.rate,
    })
    setShippingConfirmed(true)
    advanceToPayment()

    setShippingLoading(true)
    try {
      const { error } = await selectShiprocketCourier({
        cartId: cart.id,
        courierCompanyId: courier.courier_company_id,
        pincode: deliveryPincode,
        courierName: courier.courier_name,
        rate: courier.rate,
        etd: courier.etd,
        estimatedDeliveryDays: courier.estimated_delivery_days,
      })

      if (error) {
        setShippingError(error)
        setShippingOverride(null)
        setShippingConfirmed(false)
        setActiveStep("delivery")
        return
      }

      refreshCart()
    } catch (err: unknown) {
      setShippingError(
        err instanceof Error ? err.message : "Could not select courier"
      )
      setShippingOverride(null)
      setShippingConfirmed(false)
      setActiveStep("delivery")
    } finally {
      setShippingLoading(false)
    }
  }

  const ensureRazorpayReady = async (options?: {
    skipRefresh?: boolean
    /** Background prepare — no spinner on the payment card. */
    silent?: boolean
  }) => {
    logCartPayment("panel", "ensureRazorpayReady:start", {
      cartId: cart.id,
      effectiveEmail,
      skipRefresh: options?.skipRefresh ?? false,
      silent: options?.silent ?? false,
    })

    if (!isRazorpayConfigured()) {
      logCartPayment("panel", "ensureRazorpayReady:blocked — Razorpay not configured")
      if (!options?.silent) {
        setPaymentError(
          "Razorpay is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in .env.local and restart the dev server."
        )
      }
      return false
    }

    if (!effectiveEmail) {
      logCartPayment("panel", "ensureRazorpayReady:blocked — no email")
      if (!options?.silent) {
        setPaymentError("Add your email before paying.")
      }
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

    if (preparePromiseRef.current) {
      if (!options?.silent) {
        setPaymentPreparing(true)
      }
      try {
        return await preparePromiseRef.current
      } finally {
        if (!options?.silent) {
          setPaymentPreparing(false)
        }
      }
    }

    const runPrepare = async (): Promise<boolean> => {
      if (!options?.silent) {
        setPaymentPreparing(true)
      }
      setPaymentError(null)

      const error = await prepareRazorpayCheckout(cart.id)

      if (!options?.silent) {
        setPaymentPreparing(false)
      }

      if (error) {
        logCartPayment("panel", "ensureRazorpayReady:failed", { error })
        if (!options?.silent) {
          setPaymentError(error)
        }
        paymentAutoPrepared.current = false
        return false
      }

      paymentAutoPrepared.current = true
      logCartPayment("panel", "ensureRazorpayReady:success")
      if (!options?.skipRefresh) {
        refreshCart()
      }
      return true
    }

    preparePromiseRef.current = runPrepare().finally(() => {
      preparePromiseRef.current = null
    })

    return preparePromiseRef.current
  }

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

    advanceToDelivery()
  }

  const handleShippingSelect = async (methodId: string) => {
    if (methodId === selectedShippingId) {
      advanceToPayment()
      return
    }

    setShippingLoading(true)
    setShippingError(null)

    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: methodId })
      advanceToPayment()
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
  }

  const canPay =
    (Boolean(cart.shipping_address?.address_1) || addressConfirmed) &&
    Boolean(effectiveEmail) &&
    (Boolean(cart.shipping_methods?.length) || shippingConfirmed) &&
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

  const paymentCart = useMemo(() => {
    if (!shippingOverride) return cart

    const baseShiprocket =
      (cart.metadata?.shiprocket as Record<string, unknown> | undefined) ?? {}

    return {
      ...cart,
      metadata: {
        ...cart.metadata,
        shiprocket: {
          ...baseShiprocket,
          courier_name: shippingOverride.name.replace(/ via Shiprocket$/i, ""),
          rate_inr: shippingOverride.amount,
        },
      },
    }
  }, [cart, shippingOverride])

  // Warm Medusa payment session + Razorpay script while user is on delivery/payment.
  useEffect(() => {
    if (activeStep !== "delivery" && activeStep !== "payment") return
    if (!effectiveEmail || !isRazorpayConfigured()) return

    void ensureRazorpayReady({ silent: true, skipRefresh: true })
  }, [
    activeStep,
    effectiveEmail,
    cart.id,
    cart.metadata?.wt_payment,
    cart.payment_collection?.payment_sessions,
  ])

  const pincodeStatus = couriersLoading ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
      Loading delivery options…
    </p>
  ) : couriersError ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-red-500">
      {couriersError}
    </p>
  ) : shiprocketCouriers.length > 0 ? (
    <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface">
      ✓ {shiprocketCouriers.length} delivery options for {deliveryPincode}
    </p>
  ) : null

  return (
    <div
      className="flex flex-col gap-6 p-6 small:p-8 bg-surface-low"
      style={{ border: PANEL_BORDER }}
    >
      <RazorpayScriptPreloader
        enabled={
          isRazorpayConfigured() &&
          (activeStep === "delivery" || activeStep === "payment")
        }
      />
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
                  <Input
                    label="Apartment, door no., landmark"
                    name="shipping_address.address_2"
                    value={formData["shipping_address.address_2"]}
                    onChange={handleFormChange}
                    placeholder="Flat 4B, near temple, etc."
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
                    placeholder="10-digit Indian mobile"
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
              {useShiprocketDelivery ? "Choose courier · Shiprocket" : "Delivery method"}
            </p>

            {couriersLoading && (
              <div className="flex items-center gap-2 text-on-surface-muted py-2">
                <Spinner />
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase">
                  Loading live delivery rates…
                </span>
              </div>
            )}

            {useShiprocketDelivery ? (
              <div className="flex flex-col gap-2">
                {!shiprocketLive && (
                  <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                    Demo couriers — set SHIPROCKET_DEMO_MODE=false for live rates
                  </p>
                )}
                {shiprocketCouriers.map((courier) => {
                  const selected =
                    shiprocketSelection?.courier_company_id ===
                    courier.courier_company_id
                  const eta =
                    courier.etd ??
                    (courier.estimated_delivery_days
                      ? `${courier.estimated_delivery_days} day${
                          courier.estimated_delivery_days === 1 ? "" : "s"
                        }`
                      : "Standard delivery")

                  return (
                    <button
                      key={courier.courier_company_id}
                      type="button"
                      onClick={() => void handleCourierSelect(courier)}
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
                          {courier.courier_name}
                        </p>
                        <p className="mt-1 font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                          {eta} · prepaid
                        </p>
                      </div>
                      <span className="font-mono text-sm text-on-surface whitespace-nowrap">
                        <PriceText>
                          {convertToLocale({
                            amount: courier.rate,
                            currency_code: cart.currency_code,
                          })}
                        </PriceText>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : deliveryMethods.length ? (
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
            ) : !couriersLoading ? (
              <p className="font-inter text-sm text-on-surface-variant">
                {couriersError ?? "No delivery methods available for this address."}
              </p>
            ) : null}

            {shippingLoading && (
              <div className="flex items-center gap-2 text-on-surface-muted">
                <Spinner />
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase">
                  Updating delivery…
                </span>
              </div>
            )}

            {(selectedShippingId || shiprocketSelection?.courier_company_id) &&
              !shippingLoading && (
              <button
                type="button"
                onClick={() => setActiveStep("payment")}
                className="w-full py-3.5 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[10px] tracking-[0.2em] uppercase"
              >
                Continue to payment →
              </button>
            )}

            <ErrorMessage error={shippingError ?? couriersError} />
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
                void ensureRazorpayReady({ silent: true, skipRefresh: true })
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
              </div>
              <RazorpayMethodIcons className="mt-4 ml-7" compact />
            </button>

            {paymentPreparing && (
              <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                Connecting to payment…
              </p>
            )}

            <ErrorMessage error={paymentError} />
          </div>
        )}
      </div>

      <CartTotals
        totals={cart}
        variant="checkout"
        shippingOverride={shippingOverride}
      />

      {activeStep === "payment" && (
        <RazorpayPaymentButton
          notReady={notReady}
          cart={paymentCart}
          data-testid="cart-checkout-pay-button"
          buttonLabel="PROCEED TO PAY →"
          buttonClassName="w-full py-4 px-6 bg-on-surface text-surface-lowest font-grotesk font-semibold text-[11px] tracking-[0.22em] uppercase transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onBeforePay={() =>
            ensureRazorpayReady({ skipRefresh: true, silent: false })
          }
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
