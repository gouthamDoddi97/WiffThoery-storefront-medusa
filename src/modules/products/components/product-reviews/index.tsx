"use client"

import { useState } from "react"
import type { ProductReview, ReviewStats } from "@lib/data/reviews"

// ─── Single review card ───────────────────────────────────────────────────────

export function ReviewCard({ review }: { review: ProductReview }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1)
  const date = new Date(review.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="border-t border-surface-variant/20 pt-6 flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex gap-0.5">
          {stars.map((s) => (
            <span
              key={s}
              className="text-[13px] leading-none"
              style={{ color: s <= review.rating ? "#FFB547" : "rgba(255,255,255,0.15)" }}
            >
              ★
            </span>
          ))}
        </span>
        <span className="font-inter text-xs text-on-surface font-medium">
          {review.author_name}
        </span>
        <span className="font-inter text-[10px] text-on-surface-disabled">{date}</span>
      </div>
      {review.title && (
        <p className="font-inter text-sm font-medium text-on-surface">
          {review.title}
        </p>
      )}
      <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
        {review.body}
      </p>
      {review.image_urls && review.image_urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {review.image_urls.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="block w-20 h-20 overflow-hidden bg-surface-low flex-shrink-0 border border-surface-variant/20 hover:border-primary/40 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Review photo ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Rating histogram ─────────────────────────────────────────────────────────

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="font-inter text-[11px] text-on-surface-disabled w-4 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-variant/30 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-inter text-[10px] text-on-surface-disabled w-7">{count}</span>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  productId: string
  initialReviews: ProductReview[]
  initialStats: ReviewStats
}

export default function ProductReviews({
  initialReviews,
  initialStats,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? initialReviews : initialReviews.slice(0, 3)

  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: initialReviews.filter((r) => r.rating === star).length,
  }))

  return (
    <section className="py-16 bg-surface-lowest border-t border-surface-variant/20">
      <div className="content-container max-w-[720px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">CUSTOMER REVIEWS</span>
            {initialStats.total > 0 && initialStats.average !== null ? (
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-grotesk font-bold text-4xl text-on-surface">
                  {initialStats.average.toFixed(1)}
                </span>
                <span className="font-inter text-sm text-on-surface-variant">
                  / 5 &nbsp;·&nbsp; {initialStats.total} review{initialStats.total !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <p className="font-inter text-sm text-on-surface-variant mt-2">
                No reviews yet. Be the first — leave one from your{" "}
                <a href="/account/orders" className="text-primary underline underline-offset-2">order history</a>.
              </p>
            )}
          </div>
        </div>

        {/* Rating histogram */}
        {initialStats.total > 0 && (
          <div className="flex flex-col gap-2 mb-10 max-w-xs">
            {histogram.map(({ star, count }) => (
              <RatingBar
                key={star}
                label={`${star}★`}
                count={count}
                total={initialStats.total}
              />
            ))}
          </div>
        )}

        {/* Reviews list */}
        {initialReviews.length > 0 ? (
          <>
            <div className="flex flex-col gap-0">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            {initialReviews.length > 3 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-8 font-inter text-[10px] tracking-[0.18em] uppercase text-primary hover:opacity-70 transition-opacity"
              >
                {expanded ? "Show less" : `Show all ${initialReviews.length} reviews`}
              </button>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}
