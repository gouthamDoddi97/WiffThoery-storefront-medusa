import { getShipmentTracking } from "@lib/data/shipping"
import { Metadata } from "next"

type Props = {
  params: Promise<{ awb: string }>
}

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Follow your Whiff Theory shipment on its journey to you.",
  robots: { index: false, follow: false },
}

const PANEL_BORDER =
  "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 22%, transparent)"

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function TrackPage(props: Props) {
  const { awb } = await props.params
  const { tracking, error } = await getShipmentTracking(awb)

  return (
    <div className="content-container py-16 small:py-24">
      <div className="max-w-2xl mx-auto flex flex-col gap-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-on-surface-muted">
            Shipment Tracking
          </p>
          <h1 className="mt-3 font-garamond text-4xl small:text-5xl text-on-surface">
            {tracking?.delivered ? "Delivered." : "On its way."}
          </h1>
          <p className="mt-2 font-mono text-[10px] tracking-[0.14em] uppercase text-on-surface-muted">
            Tracking Nº {decodeURIComponent(awb)}
          </p>
        </div>

        {!tracking ? (
          <div className="p-6" style={{ border: PANEL_BORDER }}>
            <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
              {error ??
                "No tracking information yet — couriers can take a few hours to activate tracking."}
            </p>
            <p className="mt-3 font-mono text-[9px] tracking-[0.14em] uppercase text-on-surface-muted">
              Check back soon — this page updates automatically.
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 small:grid-cols-3 gap-px bg-surface-low"
              style={{ border: PANEL_BORDER }}
            >
              <div className="p-5">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
                  Status
                </p>
                <p className="mt-2 font-garamond text-lg text-on-surface">
                  {tracking.current_status}
                </p>
              </div>
              <div className="p-5">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
                  Courier
                </p>
                <p className="mt-2 font-garamond text-lg text-on-surface">
                  {tracking.courier ?? "—"}
                </p>
              </div>
              <div className="p-5">
                <p className="font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
                  {tracking.delivered ? "Delivered" : "Expected delivery"}
                </p>
                <p className="mt-2 font-garamond text-lg text-on-surface">
                  {tracking.delivered
                    ? "Enjoy your fragrance"
                    : tracking.etd
                    ? formatDate(tracking.etd)
                    : "—"}
                </p>
              </div>
            </div>

            {tracking.activities.length > 0 && (
              <div className="flex flex-col">
                <p className="mb-5 font-mono text-[9px] tracking-[0.16em] uppercase text-on-surface-muted">
                  Journey
                </p>
                <ol className="flex flex-col">
                  {tracking.activities.map((activity, index) => (
                    <li key={index} className="relative flex gap-5 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span
                          className={
                            index === 0
                              ? "mt-1 w-2.5 h-2.5 rounded-full bg-on-surface flex-shrink-0"
                              : "mt-1 w-2.5 h-2.5 rounded-full border border-on-surface-muted flex-shrink-0"
                          }
                          aria-hidden
                        />
                        {index < tracking.activities.length - 1 && (
                          <span
                            className="w-px flex-1 bg-on-surface/20 mt-1"
                            aria-hidden
                          />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="font-inter text-sm text-on-surface leading-snug">
                          {activity.activity}
                        </p>
                        <p className="mt-1.5 font-mono text-[9px] tracking-[0.12em] uppercase text-on-surface-muted">
                          {formatDate(activity.date)}
                          {activity.location ? ` · ${activity.location}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
