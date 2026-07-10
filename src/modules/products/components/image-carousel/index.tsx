"use client"

import { useState } from "react"

type ImageCarouselProps = {
  images: { url: string; alt: string }[]
  activeIndex?: number
  onActiveChange?: (index: number) => void
  placard?: string
  /** Tier accent for selected thumbnail border */
  accent?: string
}

const HAIRLINE = "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)"

export default function ImageCarousel({
  images,
  activeIndex: controlledActive,
  onActiveChange,
  placard,
  accent = "var(--on-surface)",
}: ImageCarouselProps) {
  const [internalActive, setInternalActive] = useState(0)
  const isControlled = controlledActive !== undefined
  const active = isControlled ? controlledActive! : internalActive

  const setActive = (i: number) => {
    if (!isControlled) setInternalActive(i)
    onActiveChange?.(i)
  }

  if (images.length === 0) return null

  return (
    <div className="relative select-none w-full small:max-w-[440px] small:mx-auto">
      {/* Main artwork — square on desktop (mock), 4:3 on mobile */}
      <div
        className="relative aspect-[4/3] small:aspect-square overflow-hidden bg-surface-lowest rounded-sm"
        style={{ border: HAIRLINE }}
      >
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt}
            className="absolute object-cover transition-opacity duration-500"
            style={{
              opacity: i === active ? 1 : 0,
              width: "95%",
              height: "95%",
              inset: 0,
              margin: "auto",
            }}
          />
        ))}
      </div>

      {/* Dot pagination — mobile */}
      {images.length > 1 && (
        <div className="flex small:hidden items-center justify-center gap-2 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to image ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: 7,
                height: 7,
                background: i === active ? "var(--on-surface)" : "transparent",
                border: "1px solid var(--on-surface)",
                opacity: i === active ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip — desktop */}
      {images.length > 1 && (
        <div className="hidden small:flex items-center gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className="relative w-[72px] h-[72px] overflow-hidden bg-surface-low flex-shrink-0 rounded-sm transition-opacity"
              style={{
                border: i === active ? `var(--hairline-width) solid ${accent}` : HAIRLINE,
                opacity: i === active ? 1 : 0.7,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {placard && (
        <p className="small:hidden font-mono text-[9px] tracking-[0.18em] uppercase text-on-surface-variant text-center mt-3">
          {placard}
        </p>
      )}
    </div>
  )
}
