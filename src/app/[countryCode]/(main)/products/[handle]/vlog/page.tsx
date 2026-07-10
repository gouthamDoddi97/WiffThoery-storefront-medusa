import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { readVlogMarkdown } from "@lib/util/scent-vlog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ScentStory, { FgPreset, Bg2Preset } from "@modules/products/components/scent-story"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle, countryCode } = await props.params
  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) notFound()

  return {
    title: `${product.title} — Scent Vlog`,
    description: `The making of ${product.title} — scent story, lab log, and vlog from the Whiff Theory studio in Vizag.`,
  }
}

const YOUTUBE_RE =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/

/** Minimal markdown block renderer — headings, lists, paragraphs, YouTube embeds. */
function renderMarkdown(md: string) {
  const blocks = md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  return blocks.map((block, i) => {
    const yt = block.match(YOUTUBE_RE)
    if (yt && block.split("\n").length === 1) {
      return (
        <div key={i} className="relative w-full aspect-video my-4">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt[1]}`}
            title="Scent vlog video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
            style={{ border: "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)" }}
          />
        </div>
      )
    }

    if (block.startsWith("#")) {
      const level = Math.min(block.match(/^#+/)?.[0].length ?? 1, 3)
      const text = block.replace(/^#+\s*/, "")
      if (level === 1) {
        return (
          <h2
            key={i}
            className="font-garamond serif-display font-medium text-3xl text-on-surface mt-10 mb-4"
            style={{ fontStyle: "normal" }}
          >
            {text}
          </h2>
        )
      }
      return (
        <h3 key={i} className="font-mono text-[11px] tracking-[0.22em] uppercase text-on-surface mt-8 mb-3">
          {text}
        </h3>
      )
    }

    if (block.split("\n").every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="flex flex-col gap-2 my-4">
          {block.split("\n").map((line, j) => (
            <li key={j} className="font-inter text-sm text-on-surface-variant leading-relaxed flex gap-3">
              <span className="text-on-surface-muted flex-shrink-0">—</span>
              {line.replace(/^- /, "")}
            </li>
          ))}
        </ul>
      )
    }

    return (
      <p key={i} className="font-inter text-base text-on-surface-variant leading-relaxed my-4">
        {block}
      </p>
    )
  })
}

export default async function ScentVlogPage(props: Props) {
  const { countryCode, handle } = await props.params
  const region = await getRegion(countryCode)
  if (!region) notFound()

  const product = await listProducts({
    countryCode,
    queryParams: { handle },
  }).then(({ response }) => response.products[0])

  if (!product) notFound()

  const [perfume, vlogMd] = await Promise.all([
    getPerfumeDetails(product.id),
    readVlogMarkdown(handle),
  ])

  const images = product.images ?? []
  const sceneImages: [string?, string?, string?] = [
    perfume?.scene_image_1 ?? images[0]?.url ?? undefined,
    perfume?.scene_image_2 ?? images[1]?.url ?? undefined,
    perfume?.scene_image_3 ?? images[2]?.url ?? undefined,
  ]

  return (
    <div className="bg-surface-lowest">
      <div className="content-container py-4 border-b rule-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <LocalizedClientLink
            href={`/products/${handle}`}
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-on-surface-muted hover:text-primary transition-colors"
          >
            ← Back to {product.title}
          </LocalizedClientLink>
          <a
            href="#vlog"
            className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary hover:opacity-80 transition-opacity"
          >
            Skip to the vlog ↓
          </a>
        </div>
      </div>

      {/* ─── Scent story — cinematic slideshow intro before the vlog ─── */}
      <ScentStory
        productTitle={product.title ?? ""}
        caption={perfume?.caption}
        scentStory={perfume?.scent_story}
        topNotes={perfume?.top_notes}
        middleNotes={perfume?.middle_notes}
        baseNotes={perfume?.base_notes}
        occasions={perfume?.occasions}
        sceneImages={sceneImages}
        fgPreset={perfume?.fg_preset as FgPreset | undefined}
        bg2Preset={perfume?.bg2_preset as Bg2Preset | undefined}
      />

      {/* ─── The vlog ─── */}
      <section id="vlog" className="border-t rule-ink scroll-mt-20">
        <div className="content-container max-w-[760px] py-14 small:py-20">
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface-muted block mb-4">
            <LocalizedClientLink href={`/products/${handle}`} className="hover:text-primary transition-colors">
              ← BACK TO {product.title?.toUpperCase()}
            </LocalizedClientLink>
          </span>

          <div className="flex items-center gap-5 mb-8">
            <h2 className="font-mono text-[11px] tracking-[0.26em] uppercase text-on-surface whitespace-nowrap">
              THE SCENT VLOG
            </h2>
            <span className="flex-1 rule-ink" />
          </div>

          {vlogMd ? (
            renderMarkdown(vlogMd)
          ) : (
            <div
              className="p-8 text-center"
              style={{ border: "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)" }}
            >
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-on-surface mb-2">
                VLOG IN PRODUCTION
              </p>
              <p className="font-inter text-sm text-on-surface-variant">
                The making-of film for {product.title} is being cut in the lab.
                The scent story above is chapter one.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
