"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { addToCart } from "@lib/data/cart"
import { FragranceSet } from "@lib/data/offers"

const ACCENT = "#C9A84C"

function formatPrice(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100)
  } catch {
    return `${currencyCode.toUpperCase()} ${(amount / 100).toFixed(0)}`
  }
}

// ── Single slide ──────────────────────────────────────────────────────────────

function SetSlide({
  set,
  countryCode,
}: {
  set: FragranceSet
  countryCode: string
}) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)
    await Promise.all(
      set.items.map((item) =>
        addToCart({ variantId: item.variant_id, quantity: 1, countryCode })
      )
    )
    setIsAdding(false)
  }

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 520 }}>
      {/* Set image as background */}
      {set.set_image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={set.set_image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,13,20,0.45) 0%, rgba(10,13,20,0.2) 40%, rgba(10,13,20,0.88) 100%)",
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative flex flex-col" style={{ padding: "28px 22px 26px", minHeight: 520 }}>
        {/* Eyebrow */}
        <div
          className="font-inter text-[10px] tracking-[0.22em] uppercase mb-3.5 flex items-center gap-2.5"
          style={{ color: ACCENT }}
        >
          <span className="block h-px w-3.5 opacity-60" style={{ background: ACCENT }} />
          {set.badge ?? "CURATED SET"}
        </div>

        {/* Set name */}
        <h3
          className="font-grotesk font-bold text-on-surface uppercase mb-3"
          style={{ fontSize: 42, lineHeight: 0.92, letterSpacing: "-0.02em" }}
        >
          {set.title}
        </h3>

        {/* Tagline */}
        {set.description && (
          <p
            className="font-garamond italic text-on-surface mb-5"
            style={{ fontSize: 18, lineHeight: 1.35, maxWidth: 300, opacity: 0.9 }}
          >
            {set.description}
          </p>
        )}

        <div className="flex-1" />

        {/* Price */}
        <div
          className="flex items-baseline gap-3 pt-3.5 mb-4"
          style={{ borderTop: `1px solid ${ACCENT}33` }}
        >
          <span className="font-inter font-bold text-xl" style={{ color: ACCENT }}>
            {formatPrice(set.price_amount, set.currency_code)}
          </span>
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 py-3.5 font-inter text-[11px] tracking-[0.18em] uppercase font-bold disabled:opacity-50 transition-opacity"
            style={{ background: ACCENT, color: "#0a0410", border: "none" }}
          >
            {isAdding ? "ADDING..." : "ADD SET TO BAG"}
          </button>
          <LocalizedClientLink
            href={`/sets/${set.id}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <button
              className="py-3.5 px-4 font-inter text-[11px] tracking-[0.18em] uppercase text-on-surface"
              style={{ background: "transparent", border: `1px solid ${ACCENT}66` }}
            >
              View Set
            </button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OffersPanel({ sets }: { sets: FragranceSet[] }) {
  const [idx, setIdx] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef<number | null>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [railWidth, setRailWidth] = useState(360)
  const { countryCode } = useParams()

  useEffect(() => {
    const el = railRef.current
    if (!el) return
    const measure = () => setRailWidth(el.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onDragStart = (clientX: number) => {
    startXRef.current = clientX
    setIsDragging(true)
  }
  const onDragMove = (clientX: number) => {
    if (startXRef.current == null) return
    setDragX(clientX - startXRef.current)
  }
  const onDragEnd = () => {
    if (startXRef.current == null) return
    const threshold = railWidth * 0.18
    if (dragX < -threshold && idx < sets.length - 1) setIdx(idx + 1)
    else if (dragX > threshold && idx > 0) setIdx(idx - 1)
    setDragX(0)
    startXRef.current = null
    setIsDragging(false)
  }

  if (!sets.length) return null

  return (
    <section className="bg-surface-lowest" style={{ padding: "56px 0 24px" }}>
      {/* Section header */}
      <div className="content-container flex justify-between items-baseline pb-5">
        <div>
          <div
            className="font-inter text-[10px] tracking-[0.22em] uppercase mb-2"
            style={{ color: ACCENT }}
          >
            Curated · Save more
          </div>
          <h2
            className="font-garamond italic text-on-surface"
            style={{ fontSize: 34, lineHeight: 1.05, margin: 0 }}
          >
            Fragrance sets.
          </h2>
        </div>
        <span className="font-inter text-[10px] tracking-[0.14em] text-on-surface-disabled">
          {String(idx + 1).padStart(2, "0")} / {String(sets.length).padStart(2, "0")}
        </span>
      </div>

      {/* Swipeable rail */}
      <div
        ref={railRef}
        onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
        onTouchEnd={onDragEnd}
        onMouseDown={(e) => onDragStart(e.clientX)}
        onMouseMove={(e) => { if (isDragging) onDragMove(e.clientX) }}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        className="relative overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${-idx * railWidth + dragX}px)`,
            transition: isDragging ? "none" : "transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
          {sets.map((set, i) => (
            <div key={set.id} style={{ flex: `0 0 ${railWidth}px`, padding: "0 20px" }}>
              <SetSlide set={set} countryCode={countryCode as string} />
            </div>
          ))}
        </div>
      </div>

      {/* Pill dot navigation */}
      <div className="flex gap-1.5 justify-center mt-5">
        {sets.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Go to set ${i + 1}`}
            style={{
              width: i === idx ? 28 : 6,
              height: 4,
              background: i === idx ? ACCENT : "rgba(255,255,255,0.2)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.3s, background 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  )
}
