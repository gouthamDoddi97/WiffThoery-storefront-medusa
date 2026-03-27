import React from "react"
import { cn } from "@lib/util/cn"

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Apply the hover lift + shadow effect (default: true) */
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface-low shadow-ambient",
          interactive &&
            "transition-all duration-300 hover:bg-surface-high hover:shadow-card-hover",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export default Card
