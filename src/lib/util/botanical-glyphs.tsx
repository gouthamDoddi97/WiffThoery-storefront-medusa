import type { ReactNode } from "react"

export { primaryNoteFromLayer } from "@lib/util/note-tokens"

/**
 * Curated etching-style botanical glyphs for the scent pyramid.
 *
 * External APIs (for expanding this library later):
 * - Wikimedia Commons — no key; search "botanical illustration {species}"
 * - Openverse — https://api.openverse.org/v1/images/?q=botanical+illustration
 * - GBIF — occurrence photos (variable license; not illustration-style)
 * - BHL — historical plates; requires API key
 *
 * We use local SVGs for consistent ink-on-paper style; APIs are best for
 * sourcing reference art to trace, not runtime rendering.
 */

type GlyphProps = { className?: string; stroke?: string }

function GlyphSvg({
  children,
  viewBox = "0 0 48 48",
  className,
}: {
  children: ReactNode
  viewBox?: string
  className?: string
}) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

const GLYPHS = {
  flower: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <circle cx="24" cy="16" r="4" />
      <circle cx="16" cy="22" r="4" />
      <circle cx="32" cy="22" r="4" />
      <circle cx="19" cy="30" r="4" />
      <circle cx="29" cy="30" r="4" />
      <path d="M24 20v14" />
      <path d="M24 34c-4 2-8 1-10 4" />
    </GlyphSvg>
  ),
  rose: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M24 10c3 4 8 5 8 10s-3 9-8 12-8-7-8-12 5-6 8-10z" />
      <path d="M20 14c2 2 4 2 4 4" />
      <path d="M24 32v10" />
      <path d="M18 42h12" />
    </GlyphSvg>
  ),
  citrus: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <circle cx="24" cy="24" r="14" />
      <path d="M24 10v28M10 24h28" />
      <path d="M14 14l20 20M34 14L14 34" />
    </GlyphSvg>
  ),
  leaf: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M24 8c-10 8-14 18-14 28 0 2 2 4 4 4 6 0 10-8 10-16 0-6-4-12-10-16z" />
      <path d="M24 8v32" />
    </GlyphSvg>
  ),
  mint: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M24 40V18" />
      <path d="M24 22c-8-4-14 0-14 8 0 4 4 6 8 4" />
      <path d="M24 28c8-4 14 0 14 8 0 4-4 6-8 4" />
      <path d="M24 34c-6-3-10-1-10 4" />
      <path d="M24 34c6-3 10-1 10 4" />
    </GlyphSvg>
  ),
  wood: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M14 38V14c0-4 4-6 10-6s10 2 10 6v24" />
      <path d="M14 22h20M14 30h20" />
      <ellipse cx="24" cy="38" rx="10" ry="3" />
    </GlyphSvg>
  ),
  resin: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M24 8l12 20H12L24 8z" />
      <path d="M16 28h16v8c0 2-2 4-4 4h-8c-2 0-4-2-4-4v-8z" />
      <path d="M20 32h8" />
    </GlyphSvg>
  ),
  spice: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M24 8v6" />
      <path d="M20 14h8l-2 26h-4L20 14z" />
      <path d="M18 22h12M19 30h10" />
    </GlyphSvg>
  ),
  pod: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <path d="M18 12c0-4 4-6 6-6s6 2 6 6v24c0 4-2 6-6 6s-6-2-6-6V12z" />
      <path d="M20 16h8M20 24h8M20 32h8" />
    </GlyphSvg>
  ),
  musk: ({ className }: GlyphProps) => (
    <GlyphSvg className={className}>
      <circle cx="24" cy="24" r="12" />
      <circle cx="24" cy="24" r="6" />
      <path d="M12 24h24M24 12v24" />
    </GlyphSvg>
  ),
} as const

type GlyphKey = keyof typeof GLYPHS

const NOTE_KEYWORDS: [RegExp, GlyphKey][] = [
  [/saffron|crocus|spice|pepper|cardamom|cinnamon|clove|nutmeg|ginger/i, "spice"],
  [/rose|jasmine|ylang|lily|peony|floral|petal|magnolia/i, "rose"],
  [/oud|agarwood|sandalwood|cedar|wood|vetiver|patchouli|guaiac/i, "wood"],
  [/vanilla|tonka|pod/i, "pod"],
  [/amber|resin|benzoin|labdanum|incense|myrrh|frankincense/i, "resin"],
  [/lemon|verbena|citrus|bergamot|orange|grapefruit|lime|mandarin/i, "citrus"],
  [/mint|peppermint|spearmint|eucalyptus|basil/i, "mint"],
  [/violet|iris|lavender|herb|leaf|fern|green|galbanum/i, "leaf"],
  [/musk|ambergris|powder/i, "musk"],
  [/aquatic|marine|water|ozone/i, "leaf"],
  [/fruit|passion|mango|peach|apple|berry|plum/i, "citrus"],
]

export function resolveBotanicalGlyph(note: string): GlyphKey {
  const normalized = note.trim().toLowerCase()
  for (const [pattern, key] of NOTE_KEYWORDS) {
    if (pattern.test(normalized)) return key
  }
  return "flower"
}

export function BotanicalGlyph({
  note,
  className = "w-full h-full",
}: {
  note: string
  className?: string
}) {
  const key = resolveBotanicalGlyph(note)
  const Icon = GLYPHS[key]
  return <Icon className={className} />
}
