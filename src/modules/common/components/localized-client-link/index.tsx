"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useTransition } from "react"

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
const LocalizedClientLink = ({
  children,
  href,
  onClick,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  passHref?: true
  [x: string]: any
}) => {
  const { countryCode } = useParams()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const fullHref = `/${countryCode}${href}`

  return (
    <Link
      href={fullHref}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
        startTransition(() => {
          router.push(fullHref)
        })
      }}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
