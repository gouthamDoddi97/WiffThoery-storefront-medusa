"use client"

import { RadioGroup } from "@headlessui/react"
import {
  getPaymentMethodTitle,
  isManual,
  isRazorpay,
  isRazorpayStandardCheckoutEnabled,
  isStripeLike,
  paymentInfoMap,
  RAZORPAY_STANDARD_CHECKOUT_ID,
} from "@lib/constants"
import { initiatePaymentSession, updateCart } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import { Container, Heading, Text, clx } from "@medusajs/ui"
import CheckoutCtaButton from "@modules/checkout/components/checkout-cta-button"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import RazorpayPaymentContainer from "@modules/checkout/components/razorpay-payment-container"
import Divider from "@modules/common/components/divider"
import RazorpayMethodIcons from "@modules/common/components/razorpay-method-icons"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

async function prepareRazorpayCheckout(cart: any) {
  await updateCart({
    metadata: {
      ...(cart.metadata ?? {}),
      wt_payment: "razorpay",
    },
  })
  await initiatePaymentSession(cart, {
    provider_id: "pp_system_default",
  })
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(() => {
    if (
      activeSession?.provider_id === "pp_system_default" &&
      cart.metadata?.wt_payment === "razorpay"
    ) {
      return RAZORPAY_STANDARD_CHECKOUT_ID
    }
    if (activeSession?.provider_id) {
      return activeSession.provider_id
    }
    return isRazorpayStandardCheckoutEnabled()
      ? RAZORPAY_STANDARD_CHECKOUT_ID
      : ""
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const paymentMethods = useMemo(() => {
    let methods = [...availablePaymentMethods]

    if (isRazorpayStandardCheckoutEnabled()) {
      methods = methods.filter((method) => !isManual(method.id))
      if (!methods.some((method) => isRazorpay(method.id))) {
        methods.unshift({ id: RAZORPAY_STANDARD_CHECKOUT_ID })
      }
    }

    return methods
  }, [availablePaymentMethods])

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
      })
    } else if (isRazorpay(method)) {
      await prepareRazorpayCheckout(cart)
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession &&
      cart?.shipping_methods.length !== 0 &&
      (activeSession.provider_id === selectedPaymentMethod ||
        (isRazorpay(selectedPaymentMethod) &&
          isManual(activeSession.provider_id)))) ||
    paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod ||
        (isRazorpay(selectedPaymentMethod) &&
          isManual(activeSession?.provider_id))

      if (!checkActiveSession) {
        if (isRazorpay(selectedPaymentMethod)) {
          await prepareRazorpayCheckout(cart)
        } else {
          await initiatePaymentSession(cart, {
            provider_id: selectedPaymentMethod,
          })
        }
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && paymentMethods?.length && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {paymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                      />
                    ) : isRazorpay(paymentMethod.id) ? (
                      <RazorpayPaymentContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <CheckoutCtaButton
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !cardComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? "Enter card details"
              : "Continue to review"}
          </CheckoutCtaButton>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-on-surface mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-on-surface-variant"
                  data-testid="payment-method-summary"
                >
                  {getPaymentMethodTitle(activeSession?.provider_id, cart)}
                </Text>
              </div>
              <div className="flex flex-col w-2/3">
                <Text className="txt-medium-plus text-on-surface mb-1">
                  Payment details
                </Text>
                <div
                  className="flex flex-col gap-2 txt-medium text-on-surface-variant"
                  data-testid="payment-details-summary"
                >
                  {isRazorpay(selectedPaymentMethod) ||
                  (isManual(activeSession?.provider_id) &&
                    cart.metadata?.wt_payment === "razorpay") ? (
                    <>
                      <RazorpayMethodIcons compact />
                      <Text className="text-sm text-on-surface-muted">
                        Complete payment in the Razorpay window on the next
                        step.
                      </Text>
                    </>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                        {paymentInfoMap[selectedPaymentMethod]?.icon || (
                          <CreditCard />
                        )}
                      </Container>
                      <Text>
                        {isStripeLike(selectedPaymentMethod) && cardBrand
                          ? cardBrand
                          : "Another step will appear"}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
