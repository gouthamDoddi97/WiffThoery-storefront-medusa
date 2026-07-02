"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export interface TierItem {
  number: string
  name: string
  tagline: string
  description: string
  href: string
  handle: string
  accentColor: string
  imageUrl: string | null
  videoUrl: string | null
}

// Spring cubic-bezier with slight overshoot — iOS bounce feel
const SPRING_CSS = "cubic-bezier(0.34, 1.22, 0.64, 1)"
const MAX_PEEK = 20   // max % of viewport height for rubber-band drag
const THRESHOLD = 0.28 // 28% of vh triggers snap
const EXIT_THRESHOLD = 0.16 // lower bar to dismiss from last slide
const LOCK_MS = 850    // lock scrolling during animation
const SHOWCASE_SEEN_KEY = "whiff-home-tier-showcase-seen"

function peekAmount(deltaPx: number, vh: number): number {
  const rawPct = (deltaPx / vh) * 100
  return Math.sign(rawPct) * Math.min(Math.sqrt(Math.abs(rawPct)) * 5.5, MAX_PEEK)
}

function shouldStartDismissed() {
  if (typeof window === "undefined") return false

  if (window.sessionStorage.getItem(SHOWCASE_SEEN_KEY) === "true") {
    return true
  }

  const referrer = window.document.referrer
  if (!referrer) return false

  try {
    return new URL(referrer).origin === window.location.origin
  } catch {
    return false
  }
}

export default function TierShowcaseClient({ tiers }: { tiers: TierItem[] }) {
  const [active, setActive] = useState(0)
  const [dragPeek, setDragPeek] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const activeRef = useRef(0)
  const isLocked = useRef(false)
  const exitedRef = useRef(false)
  const accDelta = useRef(0)
  const gestureResolved = useRef(false)
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  // Resolve SSR/client mismatch — always render on server, dismiss after hydration if already seen.
  // Must NOT use shouldStartDismissed() in useState() because sessionStorage is unavailable on server,
  // causing the initial state to differ between SSR and client hydration.
  useEffect(() => {
    if (shouldStartDismissed()) {
      exitedRef.current = true
      document.body.style.overflow = ""
      setDismissed(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lock body scroll while showcase is active so the page behind doesn't drift
  useEffect(() => {
    if (dismissed) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [dismissed])

  const clearWheelTimer = useCallback(() => {
    if (wheelEndTimer.current) {
      clearTimeout(wheelEndTimer.current)
      wheelEndTimer.current = null
    }
  }, [])

  // Exit the showcase — just unlock body scroll, dismiss instantly
  const exitShowcase = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    accDelta.current = 0
    gestureResolved.current = true
    isLocked.current = false
    clearWheelTimer()
    document.body.style.overflow = ""
    window.sessionStorage.setItem(SHOWCASE_SEEN_KEY, "true")
    setDismissed(true)
  }, [clearWheelTimer])

  const snapTo = useCallback(
    (index: number) => {
      if (index < 0) {
        setDragPeek(0)
        accDelta.current = 0
        gestureResolved.current = false
        return
      }
      if (index >= tiers.length) {
        exitShowcase()
        return
      }
      isLocked.current = true
      gestureResolved.current = true
      accDelta.current = 0
      setDragPeek(0)
      activeRef.current = index
      setActive(index)
      setTimeout(() => {
        isLocked.current = false
      }, LOCK_MS)
    },
    [tiers.length, exitShowcase]
  )

  const snapBack = useCallback(() => {
    setDragPeek(0)
    accDelta.current = 0
    gestureResolved.current = false
  }, [])

  const scheduleWheelEnd = useCallback(() => {
    clearWheelTimer()
    wheelEndTimer.current = setTimeout(() => {
      if (!isLocked.current && !gestureResolved.current) {
        snapBack()
      }
      gestureResolved.current = false
    }, 180)
  }, [clearWheelTimer, snapBack])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      if (isLocked.current) return

      if (!gestureResolved.current) {
        accDelta.current += e.deltaY
      }

      const vh = window.innerHeight
      const current = activeRef.current
      const isLast = current === tiers.length - 1
      const scrollingDown = accDelta.current > 0

      if (!gestureResolved.current) {
        setDragPeek(
          isLast && scrollingDown
            ? -Math.min(Math.sqrt(Math.abs(accDelta.current / vh) * 100) * 2.5, 12)
            : peekAmount(accDelta.current, vh)
        )
      }

      const threshold = vh * (isLast && scrollingDown ? EXIT_THRESHOLD : THRESHOLD)

      if (!gestureResolved.current && accDelta.current > threshold) {
        if (current < tiers.length - 1) snapTo(current + 1)
        else exitShowcase()
      } else if (!gestureResolved.current && accDelta.current < -threshold) {
        if (current > 0) snapTo(current - 1)
        else snapBack()
      }

      scheduleWheelEnd()
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      gestureResolved.current = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      if (isLocked.current) return

      const delta = touchStartY.current - e.touches[0].clientY
      accDelta.current = delta
      const vh = window.innerHeight
      const isLast = activeRef.current === tiers.length - 1
      const scrollingDown = delta > 0

      setDragPeek(
        isLast && scrollingDown
          ? -Math.min(Math.sqrt(Math.abs((delta / vh) * 100)) * 2.5, 12)
          : peekAmount(delta, vh)
      )
    }

    const handleTouchEnd = () => {
      if (exitedRef.current) return
      const vh = window.innerHeight
      const current = activeRef.current
      const isLast = current === tiers.length - 1
      const scrollingDown = accDelta.current > 0
      const threshold = vh * (isLast && scrollingDown ? EXIT_THRESHOLD : THRESHOLD)

      if (accDelta.current > threshold) {
        snapTo(current + 1)
      } else if (accDelta.current < -threshold && current > 0) {
        snapTo(current - 1)
      } else {
        snapBack()
      }
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    el.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      clearWheelTimer()
      el.removeEventListener("wheel", handleWheel)
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [tiers.length, snapTo, snapBack, exitShowcase, scheduleWheelEnd, clearWheelTimer])

  if (dismissed) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-surface-lowest z-[100]"
      style={{ touchAction: "none" }}
    >
      {/* Slides — initial transforms set inline so no flash before effect fires */}
      {tiers.map((tier, i) => (
        <div
          key={tier.handle}
          className="absolute inset-x-0 top-0 h-full"
          style={{
            willChange: "transform",
            transform: `translateY(${(i - active) * 100 - dragPeek}%)`,
            transition: dragPeek !== 0 ? "none" : `transform 0.82s ${SPRING_CSS}`,
          }}
        >
          <TierSlide tier={tier} />
        </div>
      ))}

      {/* Skip to store — top-right */}
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

      {/* Vertical breadcrumb — right edge */}
      <div className="absolute right-6 small:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
        {tiers.map((tier, i) => (
          <button
            key={tier.handle}
            onClick={() => { if (!isLocked.current) snapTo(i) }}
            aria-label={`Go to ${tier.name}`}
            className="flex items-center justify-center w-6 py-1"
          >
            <span
              className="block rounded-full"
              style={{
                width: "2px",
                height: i === active ? "28px" : "10px",
                background:
                  i === active
                    ? tiers[active]?.accentColor
                    : "rgba(255,255,255,0.18)",
                transition: `all 0.5s ${SPRING_CSS}`,
                boxShadow:
                  i === active
                    ? `0 0 8px ${tiers[active]?.accentColor}90`
                    : "none",
              }}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint — tap CONTINUE on last tier to dismiss */}
      <div
        className={`absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 transition-opacity duration-300 ${
          active === tiers.length - 1 ? "cursor-pointer pointer-events-auto" : "pointer-events-none"
        }`}
        style={{ opacity: 1 }}
        onClick={active === tiers.length - 1 ? exitShowcase : undefined}
        onKeyDown={
          active === tiers.length - 1
            ? (e) => { if (e.key === "Enter" || e.key === " ") exitShowcase() }
            : undefined
        }
        role={active === tiers.length - 1 ? "button" : undefined}
        tabIndex={active === tiers.length - 1 ? 0 : undefined}
        aria-label={active === tiers.length - 1 ? "Continue to store" : undefined}
      >
        <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
          {active < tiers.length - 1 ? "SCROLL" : "CONTINUE"}
        </span>
        <svg
          className="animate-bounce text-on-surface-disabled"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

function TierSlide({ tier }: { tier: TierItem }) {
  const [videoError, setVideoError] = useState(false)
  const showVideo = tier.videoUrl && !videoError

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background — video > image > nothing */}
      {showVideo ? (
        <video
          src={tier.videoUrl!}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : tier.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tier.imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Dark overlay — lighter than before so the video breathes */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(10,14,26,0.82) 0%, rgba(10,14,26,0.55) 50%, rgba(10,14,26,0.08) 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-0 w-[900px] h-[900px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at bottom left, color-mix(in srgb, ${tier.accentColor} 13%, transparent) 0%, transparent 65%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="content-container">
          <div className="flex flex-col max-w-[560px]" style={{ gap: "1.4rem" }}>

            {/* Eyebrow — thin accent rule + tier number */}
            <div className="flex items-center gap-3">
              <div
                className="h-px w-7 shrink-0"
                style={{ background: tier.accentColor }}
              />
              <span
                className="font-inter text-[9px] tracking-[0.38em] uppercase"
                style={{ color: tier.accentColor }}
              >
                {tier.number}
              </span>
            </div>

            {/* Main heading — Garamond italic for luxury editorial feel */}
            <h2
              className="font-garamond italic text-on-surface leading-[0.9]"
              style={{
                fontSize: "clamp(3.8rem, 8.5vw, 8rem)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {tier.name}
            </h2>

            {/* Tagline — Garamond italic, accent color */}
            <p
              className="font-garamond italic leading-snug"
              style={{
                color: tier.accentColor,
                fontSize: "clamp(1.05rem, 1.8vw, 1.4rem)",
                fontWeight: 400,
              }}
            >
              {tier.tagline}
            </p>

            {/* Thin rule separator */}
            <div
              className="h-px w-40"
              style={{ background: "rgba(255,255,255,0.10)" }}
            />

            {/* Description */}
            <p className="font-inter text-sm small:text-[15px] text-on-surface-variant leading-relaxed max-w-[400px]">
              {tier.description}
            </p>

            {/* Text-link CTA — line extends on hover */}
            <div className="mt-1">
              <LocalizedClientLink href={tier.href}>
                <button
                  className="group flex items-center gap-3 font-inter text-[11px] tracking-[0.22em] uppercase transition-all duration-300"
                  style={{ color: tier.accentColor }}
                >
                  <span
                    className="block h-px transition-all duration-500 group-hover:w-10"
                    style={{ background: tier.accentColor, width: "20px" }}
                  />
                  <span className="transition-all duration-300 group-hover:tracking-[0.28em]">
                    Explore Tier
                  </span>
                  <svg
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, color-mix(in srgb, ${tier.accentColor} 31%, transparent), transparent)`,
        }}
      />
    </div>
  )
}
