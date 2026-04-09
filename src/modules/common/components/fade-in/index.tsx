"use client"

import { useRef, useEffect, useState } from "react"

/**
 * Scroll-reveal wrapper. Children fade up into view once, when the element
 * enters the viewport. Uses IntersectionObserver — no Framer Motion needed.
 *
 * Usage:
 *   <FadeIn delay={150}>
 *     <p>content</p>
 *   </FadeIn>
 */
export default function FadeIn({
  children,
  delay = 0,
  distance = 28,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { rootMargin: "0px 0px -50px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : `translateY(${distance}px)`,
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
