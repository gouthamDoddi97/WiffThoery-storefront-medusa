"use client"

import { useState } from "react"

type ImageCarouselProps = {
  images: { url: string; alt: string }[]
  /** When provided, the carousel is controlled externally */
  activeIndex?: number
  onActiveChange?: (index: number) => void
}

export default function ImageCarousel({ images, activeIndex: controlledActive, onActiveChange }: ImageCarouselProps) {
  const [internalActive, setInternalActive] = useState(0)
  const isControlled = controlledActive !== undefined
  const active = isControlled ? controlledActive! : internalActive

  const setActive = (i: number) => {
    if (!isControlled) setInternalActive(i)
    onActiveChange?.(i)
  }

  const prev = () => setActive((active - 1 + images.length) % images.length)
  const next = () => setActive((active + 1) % images.length)

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0].url}
        alt={images[0].alt}
        className="w-full aspect-[3/4] object-cover bg-surface-low"
      />
    )
  }

  return (
    <div className="relative select-none">
      {/* Main image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-low">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}

        {/* Prev / Next arrow buttons */}
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-surface-lowest/80 hover:bg-surface-lowest transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-on-surface">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-surface-lowest/80 hover:bg-surface-lowest transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-on-surface">
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to image ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === active ? 20 : 6,
              height: 2,
              background: i === active ? "var(--primary)" : "var(--on-surface-disabled, #666)",
              opacity: i === active ? 1 : 0.35,
            }}
          />
        ))}
      </div>
    </div>
  )
}
