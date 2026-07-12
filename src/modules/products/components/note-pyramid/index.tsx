import Image from "next/image"
import {
  BotanicalGlyph,
  primaryNoteFromLayer,
} from "@lib/util/botanical-glyphs"
import { parseNoteTokens } from "@lib/util/note-tokens"
import type {
  PyramidPlantImage,
  PyramidPlantImages,
} from "@lib/data/plant-images"

type NotePyramidProps = {
  top?: string | null
  heart?: string | null
  base?: string | null
  plantImages?: PyramidPlantImages
}

/** Pencil-lead ink — pyramid diagram stays neutral; fragrance accent lives on buy controls only. */
const INK = "var(--on-surface)"
const INK_LINE = "color-mix(in srgb, var(--on-surface) 38%, transparent)"
const INK_HAIRLINE = "color-mix(in srgb, var(--on-surface) 12%, transparent)"

function formatLayer(notes?: string | null) {
  return parseNoteTokens(notes).join(" · ")
}

const TIER_LAYOUT = [
  {
    key: "top" as const,
    top: "14%",
    slotClass: "w-10 h-11 small:w-11 small:h-12",
  },
  {
    key: "heart" as const,
    top: "44%",
    slotClass: "w-[4.5rem] h-11 small:w-[5.25rem] small:h-12",
  },
  {
    key: "base" as const,
    top: "72%",
    slotClass: "w-[5.75rem] h-11 small:w-[6.75rem] small:h-12",
  },
]

/** Dome push-pin — photo pinned to the pyramid diagram. */
function PushPin({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <svg
        width="10"
        height="13"
        viewBox="0 0 14 18"
        className="drop-shadow-sm"
        aria-hidden
      >
        <ellipse cx="7" cy="5.5" rx="5.5" ry="4.5" fill="#8b1a1a" />
        <ellipse cx="7" cy="4.5" rx="3.8" ry="2.6" fill="#c43b3b" opacity="0.55" />
        <path d="M7 9.5v6.5" stroke="#6e6860" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="7" cy="16.5" r="0.9" fill="#6e6860" />
      </svg>
    )
  }

  return (
    <svg
      width="14"
      height="18"
      viewBox="0 0 14 18"
      className="drop-shadow-sm"
      aria-hidden
    >
      <ellipse cx="7" cy="5.5" rx="5.5" ry="4.5" fill="#8b1a1a" />
      <ellipse cx="7" cy="4.5" rx="3.8" ry="2.6" fill="#c43b3b" opacity="0.55" />
      <path d="M7 9.5v6.5" stroke="#6e6860" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="7" cy="16.5" r="0.9" fill="#6e6860" />
    </svg>
  )
}

function PinnedPlantPhoto({
  src,
  alt,
  compact = false,
  tilt = 0,
}: {
  src: string
  alt: string
  compact?: boolean
  tilt?: number
}) {
  return (
    <div
      className={`group relative w-full h-full ${compact ? "pt-1.5" : "pt-2"}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <PushPin compact={compact} />
      </div>
      <div
        className={`relative w-full h-full overflow-hidden bg-[#fffdf8] shadow-[0_2px_8px_rgba(10,8,5,0.12)] ${
          compact ? "" : "-rotate-[2deg]"
        }`}
        style={{
          border:
            "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 18%, transparent)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-0"
        />
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#fffdf8] p-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden
        >
          <span
            className={`font-mono uppercase text-on-surface text-center leading-tight ${
              compact
                ? "text-[6px] small:text-[7px] tracking-[0.06em]"
                : "text-[8px] small:text-[9px] tracking-[0.1em]"
            }`}
          >
            {alt}
          </span>
        </div>
      </div>
    </div>
  )
}

function tierTilts(count: number): number[] {
  if (count === 1) return [0]
  if (count === 2) return [-5, 5]
  return [-6, 0, 6]
}

function TierGlyphs({
  note,
  plantImages,
}: {
  note: string
  plantImages: PyramidPlantImage[]
}) {
  if (plantImages.length === 0) {
    return <BotanicalGlyph note={note} className="w-full h-full" />
  }

  if (plantImages.length === 1) {
    return (
      <PinnedPlantPhoto
        src={plantImages[0].src}
        alt={plantImages[0].alt}
      />
    )
  }

  const tilts = tierTilts(plantImages.length)

  return (
    <div className="flex items-end justify-center gap-0.5 w-full h-full px-0.5">
      {plantImages.map((img, i) => (
        <div key={`${img.src}-${i}`} className="relative flex-1 min-w-0 h-full">
          <PinnedPlantPhoto
            src={img.src}
            alt={img.alt}
            compact
            tilt={tilts[i] ?? 0}
          />
        </div>
      ))}
    </div>
  )
}

/** Ink diagram — triangle tiers with Perenual botanical refs or etching glyphs. */
export default function NotePyramid({
  top,
  heart,
  base,
  plantImages,
}: NotePyramidProps) {
  const layerData = {
    top: {
      value: formatLayer(top),
      note: primaryNoteFromLayer(top),
      label: "TOP",
      plantImages: plantImages?.top ?? [],
    },
    heart: {
      value: formatLayer(heart),
      note: primaryNoteFromLayer(heart),
      label: "HEART",
      plantImages: plantImages?.heart ?? [],
    },
    base: {
      value: formatLayer(base),
      note: primaryNoteFromLayer(base),
      label: "BASE",
      plantImages: plantImages?.base ?? [],
    },
  }

  const layers = TIER_LAYOUT.map((layout) => ({
    ...layout,
    ...layerData[layout.key],
  })).filter((l) => l.value)

  if (!layers.length) return null

  return (
    <div
      className="py-4 small:py-5"
      style={{ borderTop: `var(--hairline-width) solid ${INK_HAIRLINE}` }}
    >
      <div className="flex gap-5 small:gap-6 items-center">
        <div className="relative flex-shrink-0 w-[148px] small:w-[196px] aspect-[6/7]">
          <svg
            viewBox="0 0 120 140"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            <polygon
              points="60,6 112,128 8,128"
              fill="none"
              stroke={INK}
              strokeWidth="1.2"
            />
            <line
              x1="22"
              y1="88"
              x2="98"
              y2="88"
              stroke={INK_LINE}
              strokeWidth="0.75"
            />
            <line
              x1="32"
              y1="50"
              x2="88"
              y2="50"
              stroke={INK_LINE}
              strokeWidth="0.75"
            />
          </svg>

          {layers.map((layer, i) => {
            const tilt = i === 0 ? -3 : i === 2 ? 2 : 0
            return (
              <div
                key={layer.key}
                className={`absolute flex items-end justify-center text-on-surface ${layer.slotClass}`}
                style={{
                  top: layer.top,
                  left: "50%",
                  color: INK,
                  transform: `translateX(-50%) rotate(${tilt}deg)`,
                }}
              >
                <TierGlyphs note={layer.note} plantImages={layer.plantImages} />
              </div>
            )
          })}
        </div>

        <div className="flex flex-col justify-center gap-4 small:gap-5 flex-1 min-w-0">
          {layers.map((layer) => (
            <div
              key={layer.key}
              className="flex items-center gap-3 min-h-[22px]"
            >
              <span
                className="w-10 small:w-12 h-px flex-shrink-0"
                style={{ background: INK_LINE }}
              />
              <p className="font-mono text-[10px] small:text-[11px] tracking-[0.12em] uppercase text-on-surface leading-snug">
                <span className="text-on-surface-muted">{layer.label}: </span>
                {layer.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
