import Image from "next/image"
import {
  BotanicalGlyph,
  primaryNoteFromLayer,
} from "@lib/util/botanical-glyphs"
import type { PyramidPlantImages } from "@lib/data/plant-images"

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

function splitNotes(notes?: string | null): string[] {
  if (!notes) return []
  return notes
    .split(/[,·]/)
    .map((n) => n.trim())
    .filter(Boolean)
}

function formatLayer(notes?: string | null) {
  return splitNotes(notes).join(" · ")
}

const TIER_ICON_POSITIONS = [
  { key: "top" as const, top: "14%" },
  { key: "heart" as const, top: "44%" },
  { key: "base" as const, top: "72%" },
]

/** Dome push-pin — photo pinned to the pyramid diagram. */
function PushPin() {
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

function PinnedPlantPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-full pt-2">
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10">
        <PushPin />
      </div>
      <div
        className="relative w-full h-full overflow-hidden bg-[#fffdf8] shadow-[0_2px_8px_rgba(10,8,5,0.12)] -rotate-[2deg]"
        style={{
          border: "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 18%, transparent)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

function TierGlyph({
  note,
  plantImage,
}: {
  note: string
  plantImage: string | null
}) {
  if (plantImage) {
    return <PinnedPlantPhoto src={plantImage} alt={note} />
  }

  return <BotanicalGlyph note={note} className="w-full h-full" />
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
      plantImage: plantImages?.top ?? null,
    },
    heart: {
      value: formatLayer(heart),
      note: primaryNoteFromLayer(heart),
      label: "HEART",
      plantImage: plantImages?.heart ?? null,
    },
    base: {
      value: formatLayer(base),
      note: primaryNoteFromLayer(base),
      label: "BASE",
      plantImage: plantImages?.base ?? null,
    },
  }

  const layers = TIER_ICON_POSITIONS.map((pos) => ({
    ...pos,
    ...layerData[pos.key],
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
                className="absolute w-10 h-11 small:w-11 small:h-12 flex items-end justify-center text-on-surface"
                style={{
                  top: layer.top,
                  left: "50%",
                  color: INK,
                  transform: `translateX(-50%) rotate(${tilt}deg)`,
                }}
              >
                <TierGlyph note={layer.note} plantImage={layer.plantImage} />
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
