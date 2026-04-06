"use client"

import React, { useEffect, useRef, useState } from "react"

type SceneImages = [string?, string?, string?]

// ── How image 2 enters (fg layer, first half of scroll) ──────────────────────
export const FG_PRESETS = {
  "rise-up":  { label: "Rise Up",  description: "Image 2 rises from below, always opaque" },
  "drift-in": { label: "Drift In", description: "Image 2 drifts in from the right, always opaque" },
  "slide-in": { label: "Slide In", description: "Image 2 slides in from the right with a fade" },
  "sweep-in": { label: "Sweep In", description: "Image 2 sweeps in from the far right" },
  "bloom-up": { label: "Bloom Up", description: "Image 2 floats up from below with a soft fade" },
  "swing-in": { label: "Swing In", description: "Image 2 swings in with a slight rotation" },
} as const

// ── How image 3 enters (bg2 layer, second half of scroll) ────────────────────
export const BG2_PRESETS = {
  "dissolve-over": { label: "Dissolve Over", description: "Image 3 crossfades over the current view" },
  "veil-fall":     { label: "Veil Fall",     description: "Image 3 descends from above like a curtain" },
  "zoom-through":  { label: "Zoom Through",  description: "Image 3 punches in from an oversized scale" },
  "push-over":     { label: "Push Over",     description: "Image 1 slides left as image 3 enters from the right" },
} as const

export type FgPreset  = keyof typeof FG_PRESETS
export type Bg2Preset = keyof typeof BG2_PRESETS

type LayerState = {
  opacity?: number
  transform?: string
  filter?: string
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max)
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * clamp(progress)
}

function applyLayerState(layer: HTMLDivElement | null, state: LayerState) {
  if (!layer) return
  if (state.opacity !== undefined) layer.style.opacity = String(state.opacity)
  if (state.transform !== undefined) layer.style.transform = state.transform
  if (state.filter !== undefined) layer.style.filter = state.filter
}

function buildSceneState(
  fgPreset: FgPreset,
  bg2Preset: Bg2Preset,
  progress: number
): { bg1: LayerState; fg: LayerState; bg2: LayerState } {
  const p1 = clamp(progress / 0.5)           // 0→1 over first half of scroll
  const p2 = clamp((progress - 0.5) / 0.25)  // 0→1 over progress 0.5→0.75; holds 0.75→1.0

  // ── Phase 1: how image 2 (fg) enters ─────────────────────────────────────
  let bg1: LayerState = { opacity: 1 }
  let fg: LayerState  = { opacity: 0 }

  switch (fgPreset) {
    case "rise-up":
      bg1 = { opacity: 1, transform: `translate3d(0,${mix(0,-8,p1)}%,0) scale(${mix(1,1.02,p1)})`, filter: `blur(${mix(0,2,p1)}px)` }
      fg  = { opacity: 1, transform: `translate3d(0,${mix(52,0,p1)}%,0) scale(${mix(0.98,1,p1)})` }
      break
    case "drift-in":
      bg1 = { opacity: 1, filter: `blur(${p1*0.6}px)` }
      fg  = { opacity: 1, transform: `translate3d(${mix(32,0,p1)}%,${Math.max(14-p1*14,0)}%,0)` }
      break
    case "slide-in":
      bg1 = { opacity: 1, filter: `blur(${p1*0.8}px)` }
      fg  = { opacity: p1, transform: `translate3d(${mix(24,0,p1)}%,0,0) scale(${mix(0.98,1,p1)})` }
      break
    case "sweep-in":
      bg1 = { opacity: 1, transform: `translate3d(${mix(-6,0,p1)}%,0,0)`, filter: `blur(${mix(0,1.2,p1)}px)` }
      fg  = { opacity: clamp(p1*1.1), transform: `translate3d(${mix(48,0,p1)}%,0,0)` }
      break
    case "bloom-up":
      bg1 = { opacity: 1, filter: `blur(${mix(0,3,p1)}px) saturate(${mix(1,1.1,p1)})`, transform: `scale(${mix(1,1.02,p1)})` }
      fg  = { opacity: clamp(p1*1.2), transform: `translate3d(0,${mix(14,0,p1)}%,0) scale(${mix(0.96,1,p1)})` }
      break
    case "swing-in":
      bg1 = { opacity: 1, transform: `translate3d(${mix(0,-3,p1)}%,0,0) rotate(${mix(0,-1,p1)}deg)`, filter: `blur(${mix(0,1.2,p1)}px)` }
      fg  = { opacity: p1, transform: `translate3d(${mix(18,0,p1)}%,${mix(10,0,p1)}%,0) rotate(${mix(8,0,p1)}deg)` }
      break
  }

  // ── Phase 2: how image 3 (bg2) enters — fg stays on top, untouched ──────────
  let bg2: LayerState = { opacity: 0 }
  const b1op = bg1.opacity ?? 1

  switch (bg2Preset) {
    case "dissolve-over":
      bg1 = { ...bg1, opacity: b1op * (1 - p2) }
      bg2 = { opacity: p2 }
      break
    case "veil-fall":
      bg1 = { ...bg1, opacity: b1op * (1 - p2 * 0.85), filter: `blur(${mix(0,2,p2)}px)` }
      bg2 = { opacity: clamp(p2*1.15), transform: `translate3d(0,${mix(-12,0,p2)}%,0)` }
      break
    case "zoom-through":
      bg1 = { ...bg1, opacity: b1op * (1 - p2 * 0.9), filter: `blur(${mix(0,4,p2)}px)` }
      bg2 = { opacity: clamp(p2*1.1), transform: `scale(${mix(1.2,1,p2)})` }
      break
    case "push-over":
      bg1 = { ...bg1, opacity: mix(b1op,0,p2), transform: `translate3d(${mix(0,-30,p2)}%,0,0)` }
      bg2 = { opacity: 1, transform: `translate3d(${mix(100,0,p2)}%,0,0)` }
      break
  }

  return { bg1, fg, bg2 }
}

function PerfumeScene({
  images,
  fgPreset  = "rise-up",
  bg2Preset = "dissolve-over",
}: {
  images?: SceneImages
  fgPreset?:  FgPreset
  bg2Preset?: Bg2Preset
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const bg2Ref = useRef<HTMLDivElement>(null)
  const fgRef = useRef<HTMLDivElement>(null)

  const bg1 = images?.[0]
  const bg2 = images?.[2]
  const fg = images?.[1]

  useEffect(() => {
    const section = sectionRef.current
    const bg1Layer = bg1Ref.current
    const bg2Layer = bg2Ref.current
    const fgLayer = fgRef.current

    if (!section) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      const scrollRange = Math.max(rect.height - window.innerHeight, 1)
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollRange)
      const progress = scrolled / scrollRange
      const state = buildSceneState(fgPreset, bg2Preset, progress)

      applyLayerState(bg1Layer, state.bg1)
      applyLayerState(bg2Layer, state.bg2)
      applyLayerState(fgLayer, state.fg)
    }

    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    update()

    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [fgPreset, bg2Preset, images])

  return (
    <div ref={sectionRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-surface-lowest">
        {bg1 && (
          <div
            ref={bg1Ref}
            className="absolute inset-0"
            style={{ willChange: "opacity, filter" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bg1}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        {bg2 && (
          <div
            ref={bg2Ref}
            className="absolute inset-0 opacity-0"
            style={{ willChange: "opacity" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bg2}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        {fg && (
          <div
            ref={fgRef}
            className="absolute inset-0 opacity-0"
            style={{
              backgroundImage: `url(${fg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              willChange: "opacity, transform",
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.disconnect()
        }
      },
      { rootMargin: "-8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(28px)",
        transition: `opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ScentStoryProps = {
  productTitle: string
  caption?: string | null
  scentStory?: string | null
  topNotes?: string | null
  middleNotes?: string | null
  baseNotes?: string | null
  occasions?: string | null
  sceneImages?: SceneImages
  fgPreset?:  FgPreset
  bg2Preset?: Bg2Preset
  tierBadge?: string
  accentClass?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScentStory({
  productTitle,
  caption,
  scentStory,
  topNotes,
  middleNotes,
  baseNotes,
  occasions,
  sceneImages,
  fgPreset  = "rise-up",
  bg2Preset = "dissolve-over",
  tierBadge,
  accentClass = "text-primary",
}: ScentStoryProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const hasNotes = topNotes || middleNotes || baseNotes
  const parsedOccasions =
    occasions
      ?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? []

  // Slide 2 (fg) moves in during progress 0→0.5; slide 3 (bg2) during 0.5→1.0
  // Each text block enters with its image and exits as the next image takes over
  const titleAlpha = clamp(1 - (scrollProgress - 0.22) / 0.20)
  const titleLift = clamp((scrollProgress - 0.22) / 0.20)
  const notesAlpha = clamp((scrollProgress - 0.18) / 0.18) * clamp(1 - (scrollProgress - 0.58) / 0.18)
  const notesLift = clamp((scrollProgress - 0.58) / 0.14)
  const storyAlpha = clamp((scrollProgress - 0.55) / 0.20)
  const storyLift = clamp((scrollProgress - 0.92) / 0.08)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const updateProgress = () => {
      const rect = section.getBoundingClientRect()
      const scrollRange = Math.max(rect.height - window.innerHeight, 1)
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollRange)
      const progress = scrolled / scrollRange
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", updateProgress, { passive: true })
    window.addEventListener("resize", updateProgress)
    updateProgress()

    return () => {
      window.removeEventListener("scroll", updateProgress)
      window.removeEventListener("resize", updateProgress)
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-surface-lowest">
      <div className="absolute inset-0 z-20 pointer-events-none">
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            className="absolute inset-x-0 top-[8%] small:top-[10%] flex justify-center px-4 transition-opacity duration-300"
            style={{
              opacity: titleAlpha,
              transform: `translateY(${-titleLift * 18}px)`,
              pointerEvents: titleAlpha > 0.05 ? "auto" : "none",
            }}
          >
            <div className="pointer-events-auto w-fit max-w-[min(88vw,340px)] rounded-[18px] border border-white/25 bg-[rgba(4,5,8,0.62)] px-3 py-2 backdrop-blur-md small:max-w-[680px] small:px-5 small:py-4">
              <div className="flex flex-col items-center gap-2 text-center [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                <div className="w-6 small:w-10 h-px" style={{ background: "var(--primary)" }} />
                {tierBadge ? (
                  <span className={`font-inter text-[7px] small:text-[8px] tracking-[0.35em] small:tracking-[0.4em] uppercase ${accentClass}`}>
                    {tierBadge}
                  </span>
                ) : (
                  <span className="font-inter text-[7px] small:text-[8px] tracking-[0.35em] small:tracking-[0.4em] uppercase text-white/55">
                    WHIFF THEORY · EXTRAIT DE PARFUM
                  </span>
                )}
                <h1 className="font-garamond font-bold text-[clamp(1.8rem,8vw,4.5rem)] small:text-[clamp(2.2rem,6vw,7rem)] text-white tracking-[-0.02em] leading-[0.92]">
                  {productTitle}
                </h1>
                {caption && (
                  <p className="font-inter text-[0.72rem] small:text-sm italic text-white/70 leading-tight small:leading-relaxed max-w-[18ch] small:max-w-[32ch]">
                    {caption}
                  </p>
                )}
              </div>
            </div>
          </div>

          {hasNotes && (
            <div
              className="absolute inset-x-0 top-[38%] small:top-[40%] flex justify-center px-4 transition-opacity duration-300"
              style={{
                opacity: notesAlpha,
                transform: `translateY(${-notesLift * 22}px)`,
                pointerEvents: notesAlpha > 0.05 ? "auto" : "none",
              }}
            >
              <div className="pointer-events-auto w-fit max-w-[min(90vw,360px)] rounded-[18px] border border-white/25 bg-[rgba(4,5,8,0.62)] px-3 py-2 backdrop-blur-md small:max-w-[720px] small:px-5 small:py-4">
                <div className="flex flex-col gap-2 text-center [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                  <div className="mx-auto w-6 h-px" style={{ background: "var(--primary)" }} />
                  <span className="font-inter text-[7px] small:text-[8px] tracking-[0.32em] small:tracking-[0.35em] uppercase text-primary">
                    THE COMPOSITION
                  </span>
                  <div className="flex flex-col items-center gap-2">
                    {topNotes && (
                      <p className="font-grotesk text-[1rem] small:text-[1.35rem] text-white font-light leading-tight">
                        <span className="font-inter text-[7px] small:text-[8px] tracking-[0.28em] uppercase text-white/45 mr-2 align-middle">
                          TOP
                        </span>
                        {topNotes}
                      </p>
                    )}
                    {middleNotes && (
                      <p className="font-grotesk text-[1rem] small:text-[1.35rem] text-white font-light leading-tight">
                        <span className="font-inter text-[7px] small:text-[8px] tracking-[0.28em] uppercase text-white/45 mr-2 align-middle">
                          HEART
                        </span>
                        {middleNotes}
                      </p>
                    )}
                    {baseNotes && (
                      <p className="font-grotesk text-[1rem] small:text-[1.35rem] text-white font-light leading-tight">
                        <span className="font-inter text-[7px] small:text-[8px] tracking-[0.28em] uppercase text-white/45 mr-2 align-middle">
                          BASE
                        </span>
                        {baseNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {scentStory && (
            <div
              className="absolute inset-x-0 top-[73%] small:top-[76%] flex justify-center px-4 transition-opacity duration-300"
              style={{
                opacity: storyAlpha,
                transform: `translateY(${-storyLift * 22}px)`,
                pointerEvents: storyAlpha > 0.05 ? "auto" : "none",
              }}
            >
              <div className="pointer-events-auto w-fit max-w-[min(90vw,380px)] rounded-[18px] border border-white/25 bg-[rgba(4,5,8,0.62)] px-3 py-2 backdrop-blur-md small:max-w-[680px] small:px-5 small:py-4">
                <div className="flex flex-col gap-2 text-center [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                  <div className="mx-auto w-6 h-px" style={{ background: "var(--primary)" }} />
                  <span className="font-inter text-[7px] small:text-[8px] tracking-[0.32em] small:tracking-[0.35em] uppercase text-primary">
                    THE STORY
                  </span>
                  <p className="font-inter text-[0.85rem] small:text-[1.05rem] italic text-white/90 leading-[1.55] small:leading-[1.7] font-light">
                    {scentStory}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PerfumeScene images={sceneImages} fgPreset={fgPreset} bg2Preset={bg2Preset} />
    </section>
  )
}
