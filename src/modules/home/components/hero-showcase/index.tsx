"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import BrandLogo from "@modules/common/components/brand-logo"

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
        {/* Ivory paper background */}
        <div className="absolute inset-0 bg-surface-lowest" />

        {/* Content — gallery split: text left, framed video plate right */}
        <div className="relative z-10 h-full flex items-center">
          <div className="content-container w-full">
            <div className="grid grid-cols-1 small:grid-cols-2 gap-10 small:gap-16 items-center">
              {/* Left — headline */}
              <div className="flex flex-col gap-7 max-w-[560px]">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <BrandLogo variant="sm" />
                  <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-on-surface-variant">
                    · APPAREL PERFUME · VIZAG
                  </span>
                </div>

                <h1
                  className="font-garamond serif-display font-medium text-on-surface leading-[1.02] tracking-[-0.01em]"
                  style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.8rem)", fontStyle: "normal" }}
                >
                  Indian stories,
                  <br />
                  bottled.
                </h1>

                <p className="font-inter text-base text-on-surface-variant leading-relaxed max-w-[400px]">
                  Perfumes named after places and moments of India — composed,
                  macerated, and batch-numbered in Vizag.
                </p>

                <div className="flex flex-col xsmall:flex-row items-start gap-5">
                  <LocalizedClientLink href="/store">
                    <button className="btn-ink">
                      Explore the collection
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </LocalizedClientLink>

                  <LocalizedClientLink href="/journey">
                    <button className="font-mono text-[11px] tracking-[0.22em] uppercase text-on-surface-variant hover:text-on-surface transition-colors duration-300 flex items-center gap-2 py-4">
                      Take the scent quiz
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </LocalizedClientLink>
                </div>

                {/* Stats — mono ledger row */}
                <div className="flex items-center gap-8 pt-4 rule-ink">
                  {[
                    { value: "3", label: "TIERS" },
                    { value: "25%", label: "CONCENTRATION" },
                    { value: "VIZAG", label: "CRAFTED IN" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-1 pt-4">
                      <span className="font-garamond text-2xl text-on-surface leading-none">
                        {stat.value}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-on-surface-muted">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — video in a gallery plate */}
              <div className="hidden small:block">
                <div className="plate">
                  <video
                    src="/homeHero.webm"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <div className="flex flex-wrap items-center gap-x-2 pt-2.5 px-0.5 placard">
                    <BrandLogo variant="xs" />
                    <span>— THE COLLECTION · CRAFTED IN VIZAG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hairline */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "color-mix(in srgb, var(--on-surface) 14%, transparent)" }}
        />
      </div>

      {/* Skip button — top-right, same style as TierShowcase */}
      <div className="absolute top-5 right-16 small:top-7 small:right-24 z-50">
        <button
          onClick={exitShowcase}
          className="font-mono text-[10px] tracking-[0.18em] uppercase flex items-center gap-2 px-4 py-2 border border-on-surface/25 text-on-surface-variant hover:border-on-surface/60 hover:text-on-surface transition-all duration-200 bg-surface-lowest/60"
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
