import { ComponentPropsWithoutRef } from "react"

type PriceTextProps = ComponentPropsWithoutRef<"span"> & {
  children: React.ReactNode
}

export function renderPriceText(text: string) {
  const parts = text.split(/(₹)/g).filter((part) => part.length > 0)

  if (!parts.includes("₹")) {
    return text
  }

  return parts.map((part, index) =>
    part === "₹" ? (
      <span key={index} className="rupee-sign" aria-hidden="true">
        ₹
      </span>
    ) : (
      part
    )
  )
}

export default function PriceText({
  children,
  className,
  ...props
}: PriceTextProps) {
  const text = children == null ? "" : String(children)

  if (!text.includes("₹")) {
    return (
      <span className={className} {...props}>
        {children}
      </span>
    )
  }

  return (
    <span className={className} {...props}>
      {renderPriceText(text)}
    </span>
  )
}
