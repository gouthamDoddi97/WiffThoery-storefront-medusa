"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { VariantPrice } from "types/global"

export interface CarouselSlide {
  id: string
  title: string
  handle: string
  thumbnail: string | null
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
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (transitioning || index === current) return
      setDirection(dir ?? (index > current ? "next" : "prev"))
      setTransitioning(true)
      setProgress(0)
      setTimeout(() => {
        setCurrent(index)
        setTimeout(() => setTransitioning(false), 50)
      }, TRANSITION_MS / 2)
    },
    [transitioning, current]
  )

  const goNext = useCallback(() => goTo((current + 1) % slides.length, "next"), [current, slides.length, goTo])
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length, "prev"), [current, slides.length, goTo])

  useEffect(() => {
    if (paused) return
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (SLIDE_DURATION / 50), 100))
    }, 50)
    intervalRef.current = setInterval(goNext, SLIDE_DURATION)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [current, paused, goNext])

  const slide = slides[current]

  const textStyle = {
    opacity: transitioning ? 0 : 1,
    transform: transitioning
      ? direction === "next" ? "translateY(12px)" : "translateY(-12px)"
      : "translateY(0px)",
    transition: `opacity ${TRANSITION_MS / 2}ms ease, transform ${TRANSITION_MS / 2}ms ease`,
  }

  const imageStyle = {
    opacity: transitioning ? 0 : 1,
    transition: `opacity ${TRANSITION_MS / 2}ms ease`,
    width: "80%",
    left: "20%",
  }

  const staggerDelay = (step: number) => ({
    ...textStyle,
    transitionDelay: transitioning ? "0ms" : `${step * 40}ms`,
  })

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.targetTouches[0].clientX }}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX
        if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev()
      }}
    >
      {/* ── MOBILE layout: image top, content bottom ── */}
      <div className="small:hidden relative z-10 flex flex-col">

        {/* Image — wide landscape crop */}
        <LocalizedClientLink href={`/products/${slide.handle}`} className="relative block w-full aspect-[4/3] overflow-hidden" style={{ opacity: imageStyle.opacity, transition: imageStyle.transition }}>
          {slide.thumbnail ? (
            <img
              src={slide.thumbnail}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-container" />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(10,13,20,0.95) 100%)" }}
          />
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l pointer-events-none" style={{ borderColor: `${slide.accent}70` }} />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r pointer-events-none" style={{ borderColor: `${slide.accent}70` }} />
        </LocalizedClientLink>

        {/* Content */}
        <div className="flex flex-col gap-4 pt-6 pb-4">
          <div className="flex items-center gap-3" style={staggerDelay(0)}>
            <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: slide.accent }}>
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <span className="block h-px w-6" style={{ backgroundColor: slide.accent }} />
            <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
              {collectionTitle}
            </span>
          </div>

          <h2
            className="font-garamond italic font-normal text-on-surface leading-[0.92]"
            style={{ fontSize: "clamp(2rem, 9vw, 2.8rem)", letterSpacing: "-0.015em", ...staggerDelay(1) }}
          >
            {slide.title}
          </h2>

          {slide.scentStory && (
            <p className="font-garamond italic text-sm text-on-surface-variant leading-snug line-clamp-2" style={staggerDelay(2)}>
              {slide.scentStory}
            </p>
          )}

          {slide.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5" style={staggerDelay(3)}>
              {slide.tags.map((tag) => (
                <span key={tag.id} className="font-inter text-[8px] tracking-[0.18em] uppercase px-2 py-0.5 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
                  {tag.value}
                </span>
              ))}
            </div>
          )}

          <div style={staggerDelay(4)}>
            {slide.cheapestPrice && <InlinePrice price={slide.cheapestPrice} />}
          </div>

          <div className="flex items-center justify-between" style={staggerDelay(5)}>
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

            <div className="flex items-center gap-2">
              <button onClick={goPrev} aria-label="Previous" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={goNext} aria-label="Next" className="flex items-center justify-center w-7 h-7 border text-on-surface-variant" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP layout: text left, tall image right ── */}
      <div className="hidden small:grid relative z-10 items-stretch" style={{ gridTemplateColumns: "5fr 7fr", minHeight: "680px" }}>

        {/* Left — text */}
        <div className="flex flex-col justify-center pr-8 large:pr-12 py-14">
          <div className="flex items-center gap-3 mb-8" style={staggerDelay(0)}>
            <span className="font-inter text-[9px] tracking-[0.28em] uppercase" style={{ color: slide.accent }}>
              {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <span className="block h-px w-8" style={{ backgroundColor: slide.accent }} />
            <span className="font-inter text-[9px] tracking-[0.22em] uppercase text-on-surface-disabled">
              {collectionTitle}
            </span>
          </div>

          <h2
            className="font-garamond italic font-normal text-on-surface leading-[0.92] mb-5"
            style={{ fontSize: "clamp(2.6rem, 4.2vw, 4.4rem)", letterSpacing: "-0.015em", ...staggerDelay(1) }}
          >
            {slide.title}
          </h2>

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
            <LocalizedClientLink href={`/collections/${collectionHandle}`} className="font-inter text-[10px] tracking-[0.22em] uppercase text-on-surface-disabled hover:text-on-surface-variant transition-colors duration-300">
              View All
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={goPrev} aria-label="Previous" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goNext} aria-label="Next" className="flex items-center justify-center w-8 h-8 border text-on-surface-variant hover:text-on-surface transition-all duration-200" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Right — tall image */}
        <LocalizedClientLink href={`/products/${slide.handle}`} className="relative block overflow-hidden" style={imageStyle}>
          {slide.thumbnail ? (
            <img
              src={slide.thumbnail}
              alt={slide.title}
              className="absolute inset-0 ml-[20%] w-[80%] h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-surface-container" />
          )}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(10,13,20,1) 0%, rgba(10,13,20,0.4) 20%, transparent 45%)", marginLeft: "20%" }}
          />
          <div className="absolute top-5 left-5 w-8 h-8 border-t border-l pointer-events-none" style={{ borderColor: `${slide.accent}60`, marginLeft: "20%" }} />
          <div className="absolute bottom-5 right-5 w-8 h-8 border-b border-r pointer-events-none" style={{ borderColor: `${slide.accent}60` }} />
        </LocalizedClientLink>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 flex items-center gap-3 small:gap-4 mt-5 pb-1">
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex flex-col gap-1.5 flex-1 text-left" aria-label={`Go to ${s.title}`}>
            <div className="h-px w-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full"
                style={{
                  width: i === current ? `${progress}%` : i < current ? "100%" : "0%",
                  backgroundColor: i <= current ? slide.accent : undefined,
                }}
              />
            </div>
            <span className={`font-inter text-[8px] tracking-[0.14em] uppercase truncate transition-colors duration-300 ${i === current ? "text-on-surface-variant" : "text-on-surface-disabled"}`}>
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
