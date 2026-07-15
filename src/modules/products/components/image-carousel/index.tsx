"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useCallback, useEffect, useState } from "react"

type ImageCarouselProps = {
  images: { url: string; alt: string }[]
  activeIndex?: number
  onActiveChange?: (index: number) => void
  placard?: string
  /** Tier accent for selected thumbnail border */
  accent?: string
}

const HAIRLINE =
  "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)"

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

  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")

  const setActive = (i: number) => {
    if (!isControlled) setInternalActive(i)
    onActiveChange?.(i)
  }

  const openZoom = () => {
    setZoomed(false)
    setOrigin("50% 50%")
    setZoomOpen(true)
  }

  const closeZoom = useCallback(() => {
    setZoomOpen(false)
    setZoomed(false)
  }, [])

  const toggleZoomAt = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoomed) {
      setZoomed(false)
      setOrigin("50% 50%")
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
    setZoomed(true)
  }

  useEffect(() => {
    if (!zoomOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeZoom()
        return
      }
      if (images.length <= 1) return
      if (e.key === "ArrowRight") {
        setActive((active + 1) % images.length)
        setZoomed(false)
      }
      if (e.key === "ArrowLeft") {
        setActive((active - 1 + images.length) % images.length)
        setZoomed(false)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // setActive closes over latest active intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomOpen, active, images.length, closeZoom])

  if (images.length === 0) return null

  const current = images[active]

  return (
    <div className="relative select-none w-full small:max-w-[440px] small:mx-auto">
      {/* Main artwork — landscape on mobile (fable 16), square on desktop */}
      <button
        type="button"
        onClick={openZoom}
        aria-label="Zoom product image"
        className="relative block w-full aspect-[16/10] small:aspect-square overflow-hidden bg-surface-lowest rounded-sm cursor-zoom-in focus:outline-none focus-visible:ring-1 focus-visible:ring-on-surface"
        style={{ border: HAIRLINE }}
      >
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt}
            className="absolute object-cover transition-opacity duration-500 pointer-events-none"
            style={{
              opacity: i === active ? 1 : 0,
              width: "95%",
              height: "95%",
              inset: 0,
              margin: "auto",
            }}
          />
        ))}
      </button>

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
                border:
                  i === active
                    ? `var(--hairline-width) solid ${accent}`
                    : HAIRLINE,
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

      <Transition appear show={zoomOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[80]" onClose={closeZoom}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-surface-lowest/92 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="flex h-full w-full items-center justify-center p-4 small:p-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-[0.98]"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-[0.98]"
              >
                <Dialog.Panel className="relative flex h-full w-full max-w-5xl flex-col">
                  <div className="absolute top-0 right-0 z-10 flex items-center gap-3">
                    <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted hidden small:block">
                      {zoomed ? "Click to zoom out" : "Click to zoom in"}
                    </p>
                    <button
                      type="button"
                      onClick={closeZoom}
                      aria-label="Close zoomed image"
                      className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface hover:opacity-70 transition-opacity px-2 py-1"
                    >
                      Close
                    </button>
                  </div>

                  <div className="flex flex-1 items-center justify-center overflow-hidden pt-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={current.url}
                      alt={current.alt}
                      onClick={toggleZoomAt}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out select-none"
                      style={{
                        transform: zoomed ? "scale(2.4)" : "scale(1)",
                        transformOrigin: origin,
                        cursor: zoomed ? "zoom-out" : "zoom-in",
                      }}
                      draggable={false}
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActive((active - 1 + images.length) % images.length)
                          setZoomed(false)
                        }}
                        className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted hover:text-on-surface transition-colors"
                      >
                        ← Prev
                      </button>
                      <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
                        {active + 1} / {images.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActive((active + 1) % images.length)
                          setZoomed(false)
                        }}
                        className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted hover:text-on-surface transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
