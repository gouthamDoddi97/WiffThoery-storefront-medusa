"use client"

import Spinner from "@modules/common/icons/spinner"
import React from "react"

type CheckoutCtaButtonProps = {
  children: React.ReactNode
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  type?: "button" | "submit"
  className?: string
  "data-testid"?: string
}

export default function CheckoutCtaButton({
  children,
  disabled,
  isLoading,
  onClick,
  type = "button",
  className = "",
  "data-testid": dataTestId,
}: CheckoutCtaButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      data-testid={dataTestId}
      className={`btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading && <Spinner size="14" color="currentColor" />}
      {children}
    </button>
  )
}
