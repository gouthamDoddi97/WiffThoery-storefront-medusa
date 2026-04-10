"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Same spring feel as TierShowcase
const SPRING_CSS = "cubic-bezier(0.34, 1.22, 0.64, 1)"
const MAX_PEEK = 16      // max % offset during rubber-band drag
const THRESHOLD = 0.26   // fraction of vh that triggers exit
const HERO_SEEN_KEY = "whiff-home-hero-seen"

function shouldStartDismissed() {
  if (typeof window === "undefined") return false
  if (window.sessionStorage.getItem(HERO_SEEN_KEY) === "true") return true
  const referrer = window.document.referrer
  if (!referrer) return false
  try {
    return new URL(referrer).origin === window.location.origin
  } catch {
    return false
  }
}

export default function HeroShowcase() {
  const [dismissed, setDismissed] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const exitedRef = useRef(false)
  const accDelta = useRef(0)
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef(0)

  const setSlideY = useCallback((pct: number, animate: boolean) => {
    if (!slideRef.current) return
    slideRef.current.style.transition = animate ? `transform 0.80s ${SPRING_CSS}` : "none"
    slideRef.current.style.transform = `translateY(${pct}%)`
  }, [])

  // Set initial position without animation to avoid flash
  useEffect(() => {
    setSlideY(0, false)
  }, [setSlideY])

  // Resolve SSR/client mismatch — check sessionStorage after hydration only
  useEffect(() => {
    if (shouldStartDismissed()) {
      exitedRef.current = true
      document.body.style.overflow = ""
      setDismissed(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll while hero is active
  useEffect(() => {
    if (dismissed) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [dismissed])

  const exitShowcase = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    accDelta.current = 0
    document.body.style.overflow = ""
    window.sessionStorage.setItem(HERO_SEEN_KEY, "true")
    // Slide up, then unmount
    setSlideY(-105, true)
    setTimeout(() => setDismissed(true), 820)
  }, [setSlideY])

  const snapBack = useCallback(() => {
    setSlideY(0, true)
    accDelta.current = 0
  }, [setSlideY])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      accDelta.current += e.deltaY
      const vh = window.innerHeight
      const rawPct = (accDelta.current / vh) * 100
      // Rubber-band: slide moves slightly in scroll direction
      const peek = Math.sign(rawPct) * Math.min(Math.sqrt(Math.abs(rawPct)) * 4.5, MAX_PEEK)
      setSlideY(-peek, false)

      if (accDelta.current > vh * THRESHOLD) {
        exitShowcase()
      } else if (accDelta.current < -(vh * THRESHOLD)) {
        snapBack()
      }

      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
      wheelEndTimer.current = setTimeout(() => {
        if (!exitedRef.current) snapBack()
      }, 180)
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      const delta = touchStartY.current - e.touches[0].clientY
      accDelta.current = delta
      const vh = window.innerHeight
      const rawPct = (delta / vh) * 100
      const peek = Math.sign(rawPct) * Math.min(Math.sqrt(Math.abs(rawPct)) * 4.5, MAX_PEEK)
      setSlideY(-peek, false)
    }

    const handleTouchEnd = () => {
      if (exitedRef.current) return
      if (accDelta.current > window.innerHeight * THRESHOLD) {
        exitShowcase()
      } else {
        snapBack()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    el.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      el.removeEventListener("wheel", handleWheel)
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [exitShowcase, snapBack, setSlideY])

  if (dismissed) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-surface-lowest z-[100]"
      style={{ touchAction: "none" }}
    >
      {/* Slide — initial transform set inline to prevent flash before effect fires */}
      <div
        ref={slideRef}
        className="absolute inset-0"
        style={{ willChange: "transform", transform: "translateY(0%)" }}
      >
        {/* Background video */}
        <video
          src="/homeHero.webm"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(10,13,20,0.86) 0%, rgba(10,13,20,0.65) 50%, rgba(10,13,20,0.20) 100%)",
          }}
        />

        {/* Ambient primary glow — bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 70%)",
          }}
        />
        {/* Ambient secondary glow — top-right */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top right, color-mix(in srgb, var(--secondary) 5%, transparent) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="content-container">
            <div className="flex flex-col gap-8 max-w-[680px]">
              <span className="eyebrow">WHIFF THEORY — EXTRAIT DE PARFUM</span>

              <h1
                className="font-garamond font-bold text-on-surface leading-[0.9] tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
              >
                Every fragrance,{" "}
                <span className="text-primary italic">a chapter.</span>
              </h1>

              <p className="font-inter text-base text-on-surface-variant leading-relaxed max-w-[380px]">
                Three tiers. One journey. Extrait-concentration fragrances crafted
                and bottled in Vizag.
              </p>

              <div className="flex flex-col xsmall:flex-row items-start gap-5">
                <LocalizedClientLink href="/categories/crowd-pleaser">
                  <button className="group flex items-center gap-3 font-inter text-[11px] tracking-[0.22em] uppercase text-primary transition-all duration-300">
                    <span
                      className="block h-px bg-primary transition-all duration-500 group-hover:w-12"
                      style={{ width: "20px" }}
                    />
                    <span className="transition-all duration-300 group-hover:tracking-[0.28em]">
                      Begin the Story
                    </span>
                    <svg
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      width="11" height="11" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </LocalizedClientLink>

                <LocalizedClientLink href="/store">
                  <button className="font-inter text-[11px] tracking-[0.22em] uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-300 flex items-center gap-2">
                    Explore All
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </LocalizedClientLink>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 pt-2">
                {[
                  { value: "3", label: "TIERS" },
                  { value: "EXTRAIT", label: "CONCENTRATION" },
                  { value: "VIZAG", label: "CRAFTED IN" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-0.5">
                    <span className="font-garamond italic text-2xl text-primary leading-none">
                      {stat.value}
                    </span>
                    <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom separator line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, color-mix(in srgb, var(--primary) 30%, transparent), transparent)",
          }}
        />
      </div>

      {/* Skip button — top-right, same style as TierShowcase */}
      <div className="absolute top-5 right-16 small:top-7 small:right-24 z-50">
        <button
          onClick={exitShowcase}
          className="font-inter text-[10px] tracking-[0.18em] uppercase font-semibold flex items-center gap-2 px-4 py-2 border border-white/25 text-white/70 hover:border-white/60 hover:text-white transition-all duration-200 backdrop-blur-sm bg-white/5"
        >
          <span>SKIP TO STORE</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Scroll / swipe hint — bottom-center */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none">
        <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
          CONTINUE
        </span>
        <svg
          className="animate-bounce text-on-surface-disabled"
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}
