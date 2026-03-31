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
const LOCK_MS = 850    // lock scrolling during animation
const SHOWCASE_SEEN_KEY = "whiff-home-tier-showcase-seen"

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
  // active is React state only for breadcrumb re-render; all position logic uses activeRef
  const [active, setActive] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const activeRef = useRef(0)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const isLocked = useRef(false)
  const exitedRef = useRef(false)   // once exited, stop intercepting scroll
  const accDelta = useRef(0)
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Imperatively update slide transforms — avoids React batching issues with transitions
  const setSlidePositions = useCallback(
    (targetActive: number, animate: boolean, dragOff = 0) => {
      slideRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.transition = animate ? `transform 0.82s ${SPRING_CSS}` : "none"
        el.style.transform = `translateY(${(i - targetActive) * 100 - dragOff}%)`
      })
    },
    []
  )

  // Set initial positions without animation on mount
  useEffect(() => {
    setSlidePositions(0, false, 0)
  }, [setSlidePositions])

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

  // Exit the showcase — just unlock body scroll, dismiss instantly
  const exitShowcase = useCallback(() => {
    if (exitedRef.current) return
    exitedRef.current = true
    accDelta.current = 0
    isLocked.current = false
    document.body.style.overflow = ""
    window.sessionStorage.setItem(SHOWCASE_SEEN_KEY, "true")
    setDismissed(true)
  }, [])

  const snapTo = useCallback(
    (index: number) => {
      if (index < 0) {
        // Top edge — bounce back
        setSlidePositions(activeRef.current, true, 0)
        accDelta.current = 0
        return
      }
      if (index >= tiers.length) {
        // Past last tier — exit to page
        exitShowcase()
        return
      }
      isLocked.current = true
      activeRef.current = index
      setActive(index)
      setSlidePositions(index, true, 0)
      accDelta.current = 0
      setTimeout(() => {
        isLocked.current = false
      }, LOCK_MS)
    },
    [tiers.length, setSlidePositions, exitShowcase]
  )

  const snapBack = useCallback(() => {
    setSlidePositions(activeRef.current, true, 0)
    accDelta.current = 0
  }, [setSlidePositions])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      if (isLocked.current) return

      accDelta.current += e.deltaY
      const vh = window.innerHeight
      const rawPct = (accDelta.current / vh) * 100
      const isLast = activeRef.current === tiers.length - 1
      // Suppress downward peek on last tier — no rubber-band hint, just exit cleanly
      if (!(isLast && accDelta.current > 0)) {
        const peek =
          Math.sign(rawPct) * Math.min(Math.sqrt(Math.abs(rawPct)) * 5.5, MAX_PEEK)
        setSlidePositions(activeRef.current, false, peek)
      }

      const threshold = vh * THRESHOLD
      if (accDelta.current > threshold) {
        if (activeRef.current < tiers.length - 1) snapTo(activeRef.current + 1)
        else exitShowcase()
      } else if (accDelta.current < -threshold) {
        if (activeRef.current > 0) snapTo(activeRef.current - 1)
        else snapBack()
      }

      // Wheel end debounce
      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current)
      wheelEndTimer.current = setTimeout(() => {
        if (!isLocked.current) snapBack()
      }, 180)
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (exitedRef.current) return
      e.preventDefault()
      if (isLocked.current) return
      const delta = touchStartY.current - e.touches[0].clientY
      const isLast = activeRef.current === tiers.length - 1
      accDelta.current = delta
      if (!(isLast && delta > 0)) {
        const vh = window.innerHeight
        const rawPct = (delta / vh) * 100
        const peek =
          Math.sign(rawPct) * Math.min(Math.sqrt(Math.abs(rawPct)) * 5.5, MAX_PEEK)
        setSlidePositions(activeRef.current, false, peek)
      }
    }

    const handleTouchEnd = () => {
      if (exitedRef.current) return
      const threshold = window.innerHeight * THRESHOLD
      if (accDelta.current > threshold) {
        snapTo(activeRef.current + 1)  // handles exit if on last
      } else if (accDelta.current < -threshold && activeRef.current > 0) {
        snapTo(activeRef.current - 1)
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
  }, [tiers.length, snapTo, snapBack, setSlidePositions])

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
          ref={(el) => { slideRefs.current[i] = el }}
          className="absolute inset-x-0 top-0 h-full"
          style={{ willChange: "transform", transform: `translateY(${i * 100}%)` }}
        >
          <TierSlide tier={tier} />
        </div>
      ))}

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

      {/* Scroll hint — visible on all tiers; last tier label changes to indicate page continuation */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-300"
        style={{ opacity: 1 }}
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

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, rgba(10,14,26,0.94) 0%, rgba(10,14,26,0.78) 45%, rgba(10,14,26,0.30) 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-0 w-[700px] h-[700px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at bottom left, ${tier.accentColor}12 0%, transparent 65%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="content-container">
          <div className="flex flex-col gap-5 max-w-[640px]">
            <span
              className="font-inter text-[10px] tracking-[0.3em] uppercase"
              style={{ color: tier.accentColor }}
            >
              {tier.number}
            </span>

            <h2
              className="font-grotesk font-bold leading-[0.88] tracking-[-0.04em] text-on-surface"
              style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
            >
              {tier.name}
            </h2>

            <p
              className="font-inter text-lg small:text-xl italic"
              style={{ color: tier.accentColor }}
            >
              {tier.tagline}
            </p>

            <p className="font-inter text-sm small:text-base text-on-surface-variant leading-relaxed max-w-[460px]">
              {tier.description}
            </p>

            <div className="mt-2">
              <LocalizedClientLink href={tier.href}>
                <button
                  className="font-grotesk font-semibold tracking-[0.1em] uppercase px-8 py-4 transition-all duration-300 hover:opacity-90 inline-block"
                  style={{ background: tier.accentColor, color: "#0A0E1A" }}
                >
                  EXPLORE TIER
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
          background: `linear-gradient(to right, transparent, ${tier.accentColor}60, transparent)`,
        }}
      />
    </div>
  )
}
