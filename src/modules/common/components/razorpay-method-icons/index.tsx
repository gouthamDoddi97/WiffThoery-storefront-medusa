import { clx } from "@medusajs/ui"
import type { ReactNode } from "react"

type MethodChip = {
  id: string
  label: string
  icon: ReactNode
  accent: string
}

const methods: MethodChip[] = [
  {
    id: "upi",
    label: "UPI",
    accent: "bg-[#097939]/10 text-[#097939] border-[#097939]/25",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 8h6M9 12h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 16l2 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "card",
    label: "Cards",
    accent: "bg-[#1a1f71]/8 text-[#1a1f71] border-[#1a1f71]/20",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 15h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "netbanking",
    label: "Net Banking",
    accent: "bg-primary/10 text-primary-container border-primary/20",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M4 10l8-5 8 5v9H4v-9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 19v-5h6v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 13h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "wallet",
    label: "Wallets",
    accent: "bg-[#3395ff]/10 text-[#1d6fd8] border-[#3395ff]/25",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="M4 8a2 2 0 012-2h12a2 2 0 012 2v1H6a2 2 0 00-2 2v7a2 2 0 002 2h12v1a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="17" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
  },
]

type RazorpayMethodIconsProps = {
  compact?: boolean
  className?: string
}

const RazorpayMethodIcons = ({
  compact = false,
  className,
}: RazorpayMethodIconsProps) => {
  return (
    <div
      className={clx(
        "flex flex-wrap gap-2",
        compact ? "gap-1.5" : "gap-2",
        className
      )}
      aria-label="Accepted payment methods: UPI, cards, net banking, wallets"
    >
      {methods.map((method) => (
        <span
          key={method.id}
          className={clx(
            "inline-flex items-center gap-1.5 rounded-sm border font-inter font-medium",
            method.accent,
            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          )}
        >
          {method.icon}
          {method.label}
        </span>
      ))}
    </div>
  )
}

export default RazorpayMethodIcons
