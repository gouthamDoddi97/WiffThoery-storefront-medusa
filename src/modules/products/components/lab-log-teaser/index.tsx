import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LabLogEntry } from "@lib/util/lab-log"

type LabLogTeaserProps = {
  handle: string
  entries: LabLogEntry[]
  /** Show section when product has scent story or vlog file even without lab entries */
  showVlogLink?: boolean
}

const HAIRLINE = "color-mix(in srgb, var(--on-surface) 14%, transparent)"

/** Fine-line lab flask + rose etching — mockup plate illustration. */
function LabEtching({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M38 18h44v8H38z" />
      <path d="M42 26v10c0 8 6 14 6 22v44c0 6-4 10-10 10H36c-6 0-10-4-10-10V58c0-8 6-14 6-22V26" />
      <path d="M78 26v10c0 8-6 14-6 22v44c0 6 4 10 10 10h2c6 0 10-4 10-10V58c0-8-6-14-6-22V26" />
      <path d="M48 52h24" />
      <path d="M50 64h20" />
      <circle cx="88" cy="34" r="9" />
      <path d="M88 28c2 2 4 2 4 4s-2 4-4 6-4-4-4-6 2-2 4-4z" />
      <path d="M88 43v18" />
      <path d="M82 64c4 2 8 1 12 4" />
      <path d="M94 64c-4 2-8 1-12 4" />
    </svg>
  )
}

export default function LabLogTeaser({
  handle,
  entries,
  showVlogLink = false,
}: LabLogTeaserProps) {
  if (!entries.length && !showVlogLink) return null

  const teaserEntries = entries.slice(0, 2)
  const vlogHref = `/products/${handle}/vlog#vlog`

  return (
    <section className="border-t rule-ink bg-surface-lowest">
      <div className="content-container py-12 small:py-14">
        <h2
          className="font-garamond font-medium text-xl small:text-2xl text-on-surface tracking-[0.04em] uppercase pb-4 mb-8 small:mb-10"
          style={{ borderBottom: `var(--hairline-width) solid ${HAIRLINE}` }}
        >
          From the lab log
        </h2>

        <div className="grid grid-cols-1 small:grid-cols-[minmax(0,140px)_1fr] gap-8 small:gap-12 items-start">
          <div
            className="hidden small:flex items-center justify-center aspect-square text-on-surface opacity-70"
            style={{ border: `var(--hairline-width) solid ${HAIRLINE}` }}
          >
            <LabEtching className="w-[72%] h-[72%]" />
          </div>

          <div className="flex flex-col min-w-0">
            {teaserEntries.length > 0 ? (
              <div className="flex flex-col">
                {teaserEntries.map((entry, i) => (
                  <div
                    key={`${entry.date}-${i}`}
                    className="py-5"
                    style={{
                      borderTop: i === 0 ? `var(--hairline-width) solid ${HAIRLINE}` : undefined,
                      borderBottom: `var(--hairline-width) solid ${HAIRLINE}`,
                    }}
                  >
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-on-surface-muted block mb-3">
                      {entry.date}
                    </span>
                    <p className="font-mono text-[13px] small:text-sm text-on-surface-variant leading-[1.65] tracking-[0.01em]">
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-inter text-sm text-on-surface-variant leading-relaxed py-4">
                The making-of diary and scent story film for this fragrance live on
                the vlog page — lab notes, maceration logs, and the full story.
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-4 mt-6 pt-2">
              <LocalizedClientLink
                href={vlogHref}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-on-surface hover:text-primary transition-colors underline underline-offset-4 decoration-[color-mix(in_srgb,var(--on-surface)_30%,transparent)]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Read the vlog
              </LocalizedClientLink>
              <LocalizedClientLink
                href={vlogHref}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-primary hover:opacity-80 transition-opacity"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch the vlog
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
