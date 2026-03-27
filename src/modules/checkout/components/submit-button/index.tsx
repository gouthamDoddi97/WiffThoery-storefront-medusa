"use client"

import React from "react"
import { useFormStatus } from "react-dom"
import Spinner from "@modules/common/icons/spinner"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      data-testid={dataTestId}
      className={[
        "btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {pending && <Spinner />}
      {children}
    </button>
  )
}

