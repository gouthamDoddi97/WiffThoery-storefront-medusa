"use client"

import { useEffect, useRef, useState } from "react"

export default function PageReveal({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => {
      setVisible(true)
    }
    window.addEventListener("tier-showcase-done", handler)
    return () => window.removeEventListener("tier-showcase-done", handler)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transition: visible ? "opacity 0.5s ease" : "none",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </div>
  )
}
