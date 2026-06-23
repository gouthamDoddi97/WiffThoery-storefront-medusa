"use client"

import React from "react"
import { Button, clx } from "@medusajs/ui"

type EditorialButtonProps = React.ComponentProps<typeof Button> & {
  semantic?: "primary" | "secondary" | "link"
}

const VARIANT_MAP: Record<string, string> = {
  primary: "bg-on-surface text-surface-lowest shadow-none",
  secondary:
    "bg-transparent text-on-surface border border-surface-variant/20 p-0 hover:underline",
  link: "bg-transparent text-on-surface underline p-0",
}

export default function EditorialButton({ semantic, variant, className, ...props }: EditorialButtonProps) {
  const key = (semantic ?? variant ?? "primary") as string
  const mapped = VARIANT_MAP[key] ?? ""
  return <Button {...props} className={clx(mapped, className)} />
}
