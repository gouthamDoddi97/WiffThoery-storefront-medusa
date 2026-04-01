"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function NavigationProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)

  // Exposed via ref so event listeners always call the latest version
  const startRef = useRef(() => {})
  const finishRef = useRef(() => {})

  startRef.current = () => {
    if (activeRef.current) return
    activeRef.current = true
    clearTimeout(hideTimerRef.current!)
    clearInterval(intervalRef.current!)

    setVisible(true)
    setWidth(0)

    // Inch from 0 → 80 using exponential ease-out feel
    let w = 0
    intervalRef.current = setInterval(() => {
      w += (80 - w) * 0.12
      setWidth(Math.min(w, 80))
    }, 80)
  }

  finishRef.current = () => {
    clearInterval(intervalRef.current!)
    activeRef.current = false
    setWidth(100)
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 450)
  }

  // Finish when the new page pathname is committed
  const prevPathnameRef = useRef(pathname)
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname
      finishRef.current()
    }
  }, [pathname])

  // Start on mousedown on any internal link (fires before click/router)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const anchor = (e.target as Element)?.closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href") ?? ""
      // Skip external, hash, mailto links and new-tab
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        /^https?:\/\//.test(href) ||
        anchor.getAttribute("target") === "_blank"
      ) return
      startRef.current()
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${width}%`,
          transitionProperty: "width",
          transitionDuration: width === 100 ? "250ms" : "80ms",
          transitionTimingFunction: "ease-out",
        }}
      />
    </div>
  )
}
