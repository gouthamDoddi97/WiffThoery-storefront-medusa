import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_SRC,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@lib/constants/brand"
import { clx } from "@medusajs/ui"
import Image from "next/image"

const HEIGHT = {
  xs: "h-4",
  sm: "h-5",
  nav: "h-6 small:h-9",
  checkout: "h-7 small:h-8",
  menu: "h-5",
  md: "h-7",
  footer: "h-9",
  lg: "h-10",
} as const

type BrandLogoProps = {
  variant?: keyof typeof HEIGHT
  className?: string
  priority?: boolean
}

export default function BrandLogo({
  variant = "md",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt={BRAND_NAME}
      width={BRAND_LOGO_WIDTH}
      height={BRAND_LOGO_HEIGHT}
      priority={priority}
      className={clx("w-auto object-contain object-left", HEIGHT[variant], className)}
    />
  )
}
