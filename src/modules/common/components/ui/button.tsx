import React from "react"
import { cn } from "@lib/util/cn"

type ButtonVariant = "primary" | "ghost" | "text"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  as?: "button" | "a"
  href?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-cta text-surface-lowest font-grotesk font-semibold tracking-[0.1em] uppercase px-8 py-4 inline-block transition-opacity duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
  ghost:
    "border border-primary text-primary bg-transparent font-grotesk font-semibold tracking-[0.1em] uppercase px-8 py-4 inline-block transition-all duration-300 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed",
  text: "text-primary font-inter underline underline-offset-4 bg-transparent transition-colors duration-200 hover:text-primary-container disabled:opacity-40 disabled:cursor-not-allowed",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
