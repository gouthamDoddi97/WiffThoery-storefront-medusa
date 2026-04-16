"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { VariantPrice } from "types/global"

export interface CarouselSlide {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  bgImage: string | null
  tags: { id: string; value: string }[]
  cheapestPrice: VariantPrice | undefined | null
  scentStory: string | null
  accent: string
}

const SLIDE_DURATION = 5000
const TRANSITION_MS = 500

function InlinePrice({ price }: { price: VariantPrice }) {
  return (
    <div className="flex items-center gap-2">
      {price.price_type === "sale" && (
        <span className="font-inter text-xs text-on-surface-disabled line-through">
          {price.original_price}
        </span>
      )}
      <span
        className={
          price.price_type === "sale"
            ? "font-grotesk font-semibold text-lg text-secondary"
            : "font-grotesk font-semibold text-lg text-primary"
        }
      >
        <span className="font-inter font-normal text-[10px] tracking-[0.1em] uppercase text-on-surface-disabled mr-1">From</span>
        {price.calculated_price}
      </span>
    </div>
  )
}

export default function CollectionCarousel({
  slides,
  collectionHandle,
  collectionTitle,
}: {
  slides: CarouselSlide[]
  collectionHandle: string
  collectionTitle: string
}) {
  const [current, setCurrent] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [paused, setPaused] = useState(false)

  // Refs so interval callbacks always read the latest values without needing to restart
  const currentRef = useRef(0)
  const transitioningRef = useRef(false)
  const pausedRef = useRef(false)
  const slidesLenRef = useRef(slides.length)
  const elapsedRef = useRef(0)

  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  // Keep refs in sync with state/props
  useEffect(() => { slidesLenRef.current = slides.length }, [slides.length])
  useEffect(() => { pausedRef.current = paused }, [paused])

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
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
    },
    []
  )

  const goNext = useCallback(() => {
    goTo((currentRef.current + 1) % slidesLenRef.current, "next")
  }, [goTo])

  const goPrev = useCallback(() => {
    goTo((currentRef.current - 1 + slidesLenRef.current) % slidesLenRef.current, "prev")
  }, [goTo])

  // Single interval — started once on mount, never recreated on slide change.
  // All mutable values are read via refs, so closures are always fresh.
  useEffect(() => {
    progressRef.current = setInterval(() => {
      if (pausedRef.current) return
      elapsedRef.current += 50
      if (elapsedRef.current >= SLIDE_DURATION) {
        elapsedRef.current = 0
        if (!transitioningRef.current) {
          goNext()
        }
      }
    }, 50)

    return () => {
      if (progressRef.current) clearInterval(progressRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const router = useRouter()
  const { countryCode } = useParams()

  const slide = slides[current]

  const textStyle = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning
      ? direction === "next" ? "translateY(12px)" : "translateY(-12px)"
      : "translateY(0px)",
    transition: `opacity ${TRANSITION_MS / 2}ms ease, transform ${TRANSITION_MS / 2}ms ease`,
  }

  const staggerDelay = (step: number) => ({
    ...textStyle,
    transitionDelay: transitioning ? "0ms" : `${step * 40}ms`,
  })

  return (
    <div
      className="relative overflow-hidden bg-surface-lowest cursor-pointer"
      style={{ minHeight: "80svh" }}
      onClick={() => router.push(`/${countryCode}/products/${slide.handle}`)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev()
      }}
    >
      {slide.bgImage && (
        <>
          <img
            src={slide.bgImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
            style={{ opacity: 0.35 }}
          />
          {/* Gradient: solid dark on the text side, fades to transparent on the image side */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{ background: "linear-gradient(to right, rgba(10,13,20,1) 30%, rgba(10,13,20,0.85) 50%, rgba(10,13,20,0.3) 75%, transparent 100%)" }}
          />
        </>
      )}
      {/* Inner content — padded */}
      <div className="content-container relative z-[2] flex flex-col" style={{ minHeight: "inherit" }}>

        {/* Collection header: FEATURED + name + VIEW ALL */}
        <div className="flex items-end justify-between pt-10 small:pt-14 pb-6 small:pb-8">
          <div className="flex flex-col gap-1">
            <span className="font-inter text-[9px] tracking-[0.3em] uppercase text-on-surface-disabled">FEATURED</span>
            <h2
              className="font-garamond italic font-normal text-on-surface"
              style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", letterSpacing: "-0.01em" }}
            >
              {collectionTitle}
            </h2>
          </div>
          <span onClick={(e) => e.stopPropagation()}>
          <LocalizedClientLink
            href={`/collections/${collectionHandle}`}
            className="font-inter text-xs tracking-[0.15em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2"
          >
            VIEW ALL
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </LocalizedClientLink>
          </span>
        </div>

        {/* ── MOBILE layout ── */}
        <div className="small:hidden flex flex-col flex-1 pb-10">
          <div className="flex items-center gap-3" style={staggerDelay(0)}>
            <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: slide.accent }}>
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <span className="block h-px w-6" style={{ backgroundColor: slide.accent }} />
          </div>

          <h3
            className="font-garamond italic font-normal text-on-surface leading-[0.92] mt-8"
            style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)", letterSpacing: "-0.015em", ...staggerDelay(1) }}
          >
            {slide.title}
          </h3>

          {slide.scentStory && (
            <p className="font-garamond italic text-base text-on-surface-variant leading-snug line-clamp-4 mt-6" style={staggerDelay(2)}>
              {slide.scentStory}
            </p>
          )}

          {slide.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-8" style={staggerDelay(3)}>
              {slide.tags.map((tag) => (
                <span key={tag.id} className="font-inter text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          {/* Spacer pushes price+controls to bottom */}
          <div className="flex-1" />

          <div className="mt-8" style={staggerDelay(4)}>
            {slide.cheapestPrice && <InlinePrice price={slide.cheapestPrice} />}
          </div>

          <div className="flex items-center justify-between mt-6 mb-6" style={staggerDelay(5)}>
            <span onClick={(e) => e.stopPropagation()}>
            <LocalizedClientLink
              href={`/products/${slide.handle}`}
              className="group flex items-center gap-2 font-inter text-[10px] tracking-[0.22em] uppercase"
              style={{ color: slide.accent }}
            >
              <span className="block h-px transition-all duration-500 group-hover:w-5" style={{ backgroundColor: slide.accent, width: "12px" }} />
              Explore
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </LocalizedClientLink>
            </span>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Previous" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden small:flex items-stretch" style={{ minHeight: "420px" }}>
          <div className="flex flex-col justify-center pb-10 max-w-[600px]">
            <div className="flex items-center gap-3 mb-8" style={staggerDelay(0)}>
              <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: slide.accent }}>
                {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
              <span className="block h-px w-8" style={{ backgroundColor: slide.accent }} />
            </div>

            <h3
              className="font-garamond italic font-normal text-on-surface leading-[0.92] mb-5"
              style={{ fontSize: "clamp(2.6rem, 4.2vw, 4.4rem)", letterSpacing: "-0.015em", ...staggerDelay(1) }}
            >
              {slide.title}
            </h3>

            {slide.scentStory && (
              <p
                className="font-garamond italic text-on-surface-variant leading-snug mb-5 line-clamp-4"
                style={{ fontSize: "2rem", letterSpacing: "-0.01em", ...staggerDelay(2) }}
              >
                {slide.scentStory}
              </p>
            )}

            {slide.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-7" style={staggerDelay(3)}>
                {slide.tags.map((tag) => (
                  <span key={tag.id} className="font-inter text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                    {tag.value}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-8" style={staggerDelay(4)}>
              {slide.cheapestPrice && <InlinePrice price={slide.cheapestPrice} />}
            </div>

            <div className="flex items-center gap-6 mb-12" style={staggerDelay(5)}>
              <span onClick={(e) => e.stopPropagation()}>
            <LocalizedClientLink
                href={`/products/${slide.handle}`}
                className="group flex items-center gap-2.5 font-inter text-[10px] tracking-[0.22em] uppercase transition-opacity duration-200 hover:opacity-70"
                style={{ color: slide.accent }}
              >
                <span className="block h-px transition-all duration-500 group-hover:w-6" style={{ backgroundColor: slide.accent, width: "14px" }} />
                Explore
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </LocalizedClientLink>
            </span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Previous" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Next" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <>
          <style>{`@keyframes _collectionProgress { from { width: 0% } to { width: 100% } }`}</style>
          <div className="flex items-center mb-6 gap-3 small:gap-4 pb-8 small:pb-12">
            {slides.map((s, i) => (
              <button key={s.id} onClick={(e) => { e.stopPropagation(); goTo(i) }} className="flex flex-col gap-1.5 flex-1 text-left" aria-label={`Go to ${s.title}`}>
                <div className="h-px w-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <div
                    key={i === current ? `a${current}` : `p${i}`}
                    className="h-full"
                    style={
                      i === current
                        ? {
                            animationName: "_collectionProgress",
                            animationDuration: `${SLIDE_DURATION}ms`,
                            animationTimingFunction: "linear",
                            animationFillMode: "forwards",
                            animationPlayState: paused ? "paused" : "running",
                            backgroundColor: slide.accent,
                          }
                        : { width: i < current ? "100%" : "0%", backgroundColor: i < current ? slide.accent : undefined }
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
      </div>
    </div>
  )
}
