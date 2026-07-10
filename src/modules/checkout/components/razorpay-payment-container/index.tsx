"use client"

import { Radio as RadioGroupOption } from "@headlessui/react"
import { clx } from "@medusajs/ui"

import Radio from "@modules/common/components/radio"
import RazorpayMethodIcons from "@modules/common/components/razorpay-method-icons"

type RazorpayPaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
}

const RazorpayPaymentContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  disabled = false,
}: RazorpayPaymentContainerProps) => {
  const isSelected = selectedPaymentOptionId === paymentProviderId
  const isTestMode = process.env.NEXT_PUB_RAZORPAY_KEY_ID?.startsWith(
    "rzp_test_"
  )

  return (
    <RadioGroupOption
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "flex flex-col gap-y-3 cursor-pointer py-5 border rounded-sm px-6 mb-2 transition-shadow",
        "hover:shadow-borders-interactive-with-active",
        {
          "border-primary shadow-borders-interactive-with-active bg-surface-low/40":
            isSelected,
          "border-surface-variant": !isSelected,
        }
      )}
      data-testid="razorpay-payment-option"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-x-4 min-w-0">
          <div className="mt-1 shrink-0">
            <Radio checked={isSelected} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-grotesk font-semibold text-base text-on-surface">
                Razorpay
              </span>
              <span className="font-inter text-[10px] font-semibold tracking-[0.14em] uppercase text-[#072654] bg-[#072654]/8 px-2 py-0.5 rounded-sm">
                Secure checkout
              </span>
            </div>
            <p className="font-inter text-sm text-on-surface-muted">
              UPI, debit & credit cards, net banking, and wallets — choose in the
              next step.
            </p>
          </div>
        </div>
        <svg
          viewBox="0 0 80 20"
          className="h-5 w-auto shrink-0 opacity-90"
          aria-label="Razorpay"
          role="img"
        >
          <text
            x="0"
            y="15"
            fill="#072654"
            fontFamily="Space Grotesk, sans-serif"
            fontSize="14"
            fontWeight="700"
          >
            Razorpay
          </text>
        </svg>
      </div>

      <RazorpayMethodIcons className="pl-8" />

      {isTestMode && (
        <p className="pl-8 font-inter text-xs text-on-surface-muted leading-relaxed">
          <span className="font-medium text-primary-container">Test mode:</span>{" "}
          UPI and some wallets may not appear in the Razorpay popup until you
          switch to live keys. Cards and test net banking work for demo
          checkouts.
        </p>
      )}
    </RadioGroupOption>
  )
}

export default RazorpayPaymentContainer
