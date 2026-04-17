"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { FragranceSet } from "@lib/data/offers"

const SLIDE_DURATION = 6000
const TRANSITION_MS = 500
const ACCENT = "#C9A84C"

function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100)
  } catch {
    return `${currencyCode.toUpperCase()} ${amount / 100}`
  }
}

export default function OffersPanel({ sets }: { sets: FragranceSet[] }) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [paused, setPaused] = useState(false)

  const currentRef = useRef(0)
  const transitioningRef = useRef(false)
  const pausedRef = useRef(false)
  const setsLenRef = useRef(sets.length)
  const elapsedRef = useRef(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  useEffect(() => { setsLenRef.current = sets.length }, [sets.length])
  useEffect(() => { pausedRef.current = paused }, [paused])

  const goTo = useCallback((index: number, dir?: "next" | "prev") => {
    if (transitioningRef.current || index === currentRef.current) return
    elapsedRef.current = 0
    setDirection(dir ?? (index > currentRef.current ? "next" : "prev"))
    setTransitioning(true)
    transitioningRef.current = true
    setTimeout(() => {
      setCurrent(index)
      currentRef.current = index
      setTimeout(() => {
        setTransitioning(false)
        transitioningRef.current = false
      }, 50)
    }, TRANSITION_MS / 2)
  }, [])

  const goNext = useCallback(() => goTo((currentRef.current + 1) % setsLenRef.current, "next"), [goTo])
  const goPrev = useCallback(() => goTo((currentRef.current - 1 + setsLenRef.current) % setsLenRef.current, "prev"), [goTo])

  useEffect(() => {
    if (sets.length <= 1) return
    progressRef.current = setInterval(() => {
      if (pausedRef.current) return
      elapsedRef.current += 50
      if (elapsedRef.current >= SLIDE_DURATION) {
        elapsedRef.current = 0
        if (!transitioningRef.current) goNext()
      }
    }, 50)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { countryCode } = useParams()
  const router = useRouter()

  if (!sets.length) {
    return (
      <div className="content-container py-4">
        <p className="font-inter text-xs text-on-surface-disabled">No active offers at the moment. Check back soon.</p>
      </div>
    )
  }

  const set = sets[current]
  const thumbs = set.items.map((item) => item.thumbnail).filter(Boolean)
  const bgThumb = thumbs[0] ?? null

  const textStyle = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning
      ? direction === "next" ? "translateY(12px)" : "translateY(-12px)"
      : "translateY(0px)",
    transition: `opacity ${TRANSITION_MS / 2}ms ease, transform ${TRANSITION_MS / 2}ms ease`,
  }
  const stagger = (step: number) => ({
    ...textStyle,
    transitionDelay: transitioning ? "0ms" : `${step * 40}ms`,
  })

  return (
    <div
      className="relative overflow-hidden bg-surface-lowest cursor-pointer"
      style={{ minHeight: "72svh" }}
      onClick={() => router.push(`/${countryCode}/sets/${set.id}`)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev()
      }}
    >
      {/* Blurred background image */}
      {bgThumb && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgThumb}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
            style={{ opacity: 0.22 }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: "linear-gradient(to right, rgba(10,13,20,1) 30%, rgba(10,13,20,0.88) 55%, rgba(10,13,20,0.15) 100%)" }}
          />
        </>
      )}

      <div className="content-container relative z-[2] flex flex-col" style={{ minHeight: "inherit" }}>

        {/* Header */}
        <div className="flex items-end justify-between pt-10 small:pt-14 pb-6 small:pb-8">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled">OFFERS</span>
            <h2
              className="font-garamond italic font-normal text-on-surface"
              style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.01em" }}
            >
              Fragrance Sets
            </h2>
          </div>
        </div>

        {/* ── MOBILE layout ── */}
        <div className="small:hidden flex flex-col flex-1 pb-10">
          {/* Product thumbnails — side by side */}
          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(thumbs.length, 2)}, 1fr)`, ...stagger(0) }}>
            {thumbs.slice(0, 4).map((src, i) => (
              <div key={i} className="aspect-[2/3] overflow-hidden bg-transparent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src!}
                  alt={set.items[i]?.product_title ?? ""}
                  className="w-full h-full object-contain object-center"
                />
              </div>
            ))}
          </div>

          {set.badge && (
            <span
              className="font-inter text-[8px] tracking-[0.22em] uppercase text-primary border border-primary/40 px-2 py-0.5 self-start mb-3"
              style={stagger(1)}
            >
              {set.badge}
            </span>
          )}

          <div className="flex items-center gap-3 mb-4" style={stagger(2)}>
            {sets.length > 1 && (
              <>
                <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: ACCENT }}>
                  {String(current + 1).padStart(2, "0")} / {String(sets.length).padStart(2, "0")}
                </span>
                <span className="block h-px w-6" style={{ backgroundColor: ACCENT }} />
              </>
            )}
          </div>

          <h3
            className="font-garamond italic font-normal text-on-surface leading-[0.92] mb-4"
            style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)", letterSpacing: "-0.015em", ...stagger(3) }}
          >
            {set.title}
          </h3>

          {set.description && (
            <p className="font-garamond italic text-base text-on-surface-variant leading-snug line-clamp-3 mb-4" style={stagger(4)}>
              {set.description}
            </p>
          )}

          <div className="flex flex-col gap-0.5 mb-6" style={stagger(5)}>
            {set.items.map((item) => (
              <div key={item.variant_id} className="flex items-center gap-1.5">
                <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled">{item.product_title}</span>
                <span className="text-on-surface-disabled text-[9px]">·</span>
                <span className="font-inter text-[9px] text-on-surface-disabled">{item.variant_title}</span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div style={stagger(6)}>
            <span className="font-grotesk font-semibold text-xl" style={{ color: ACCENT }}>
              {formatPrice(set.price_amount, set.currency_code)}
            </span>
          </div>

          <div className="flex items-center justify-between mt-6" style={stagger(7)}>
            <span onClick={(e) => e.stopPropagation()}>
              <LocalizedClientLink
                href={`/sets/${set.id}`}
                className="group flex items-center gap-2 font-inter text-[10px] tracking-[0.22em] uppercase"
                style={{ color: ACCENT }}
              >
                <span className="block h-px transition-all duration-500 group-hover:w-5" style={{ backgroundColor: ACCENT, width: "12px" }} />
                View Set
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </LocalizedClientLink>
            </span>
            {sets.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Previous" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden small:flex items-stretch gap-16 flex-1" style={{ minHeight: "420px" }}>
          {/* Left: set info */}
          <div className="flex flex-col justify-center pb-10 flex-1 max-w-[480px]">
            {sets.length > 1 && (
              <div className="flex items-center gap-3 mb-8" style={stagger(0)}>
                <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: ACCENT }}>
                  {String(current + 1).padStart(2, "0")} / {String(sets.length).padStart(2, "0")}
                </span>
                <span className="block h-px w-8" style={{ backgroundColor: ACCENT }} />
              </div>
            )}

            {set.badge && (
              <span
                className="font-inter text-[8px] tracking-[0.22em] uppercase text-primary border border-primary/40 px-2 py-0.5 self-start mb-4"
                style={stagger(1)}
              >
                {set.badge}
              </span>
            )}

            <h3
              className="font-garamond italic font-normal text-on-surface leading-[0.92] mb-5"
              style={{ fontSize: "clamp(2.6rem, 4.2vw, 4.4rem)", letterSpacing: "-0.015em", ...stagger(2) }}
            >
              {set.title}
            </h3>

            {set.description && (
              <p
                className="font-garamond italic text-on-surface-variant leading-snug mb-5 line-clamp-3"
                style={{ fontSize: "1.5rem", letterSpacing: "-0.01em", ...stagger(3) }}
              >
                {set.description}
              </p>
            )}

            <div className="flex flex-col gap-1 mb-7" style={stagger(4)}>
              {set.items.map((item) => (
                <div key={item.variant_id} className="flex items-center gap-2">
                  <span className="font-inter text-[9px] tracking-[0.15em] uppercase text-on-surface-disabled">{item.product_title}</span>
                  <span className="text-on-surface-disabled text-[9px]">·</span>
                  <span className="font-inter text-[9px] text-on-surface-disabled">{item.variant_title}</span>
                </div>
              ))}
            </div>

            <div className="mb-8" style={stagger(5)}>
              <span className="font-grotesk font-semibold text-2xl" style={{ color: ACCENT }}>
                {formatPrice(set.price_amount, set.currency_code)}
              </span>
            </div>

            <div className="flex items-center gap-6 mb-12" style={stagger(6)}>
              <span onClick={(e) => e.stopPropagation()}>
                <LocalizedClientLink
                  href={`/sets/${set.id}`}
                  className="group flex items-center gap-2.5 font-inter text-[10px] tracking-[0.22em] uppercase transition-opacity duration-200 hover:opacity-70"
                  style={{ color: ACCENT }}
                >
                  <span className="block h-px transition-all duration-500 group-hover:w-6" style={{ backgroundColor: ACCENT, width: "14px" }} />
                  View Set
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </LocalizedClientLink>
              </span>
            </div>

            {sets.length > 1 && (
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Previous" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* Right: product thumbnails side-by-side */}
          <div className="flex-1 flex items-center gap-3 py-10" style={stagger(1)}>
            {thumbs.slice(0, 4).map((src, i) => (
              <div key={i} className="flex-1 h-full max-h-[380px] overflow-hidden bg-transparent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src!}
                  alt={set.items[i]?.product_title ?? ""}
                  className="w-full h-full object-contain object-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar — only when multiple sets */}
        {sets.length > 1 && (
          <>
            <style>{`@keyframes _offersProgress { from { width: 0% } to { width: 100% } }`}</style>
            <div className="flex items-center gap-3 small:gap-4 pb-8 small:pb-12">
              {sets.map((s, i) => (
                <button
                  key={s.id}
                  onClick={(e) => { e.stopPropagation(); goTo(i) }}
                  className="flex flex-col gap-1.5 flex-1 text-left"
                  aria-label={`Go to ${s.title}`}
                >
                  <div className="h-px w-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <div
                      key={i === current ? `a${current}` : `p${i}`}
                      className="h-full"
                      style={
                        i === current
                          ? {
                              animationName: "_offersProgress",
                              animationDuration: `${SLIDE_DURATION}ms`,
                              animationTimingFunction: "linear",
                              animationFillMode: "forwards",
                              animationPlayState: paused ? "paused" : "running",
                              backgroundColor: ACCENT,
                            }
                          : { width: i < current ? "100%" : "0%", backgroundColor: i < current ? ACCENT : undefined }
                      }
                    />
                  </div>
                  <span className={`font-inter text-[8px] tracking-[0.14em] uppercase truncate transition-colors duration-300 ${i === current ? "text-on-surface-variant" : "text-on-surface-disabled"}`}>
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
