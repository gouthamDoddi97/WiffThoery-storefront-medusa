"use client"

import { useState, useRef } from "react"
import { submitReview, uploadReviewImage } from "@lib/data/reviews"
import type { ProductReview, ReviewStats } from "@lib/data/reviews"

// ─── Star rating input ────────────────────────────────────────────────────────

function StarInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
          className="text-2xl leading-none transition-colors"
          style={{ color: s <= display ? "#FFB547" : "rgba(255,255,255,0.2)" }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

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

// ─── Image upload input ───────────────────────────────────────────────────────

function ImageUploadInput({
  images,
  onChange,
}: {
  images: string[]
  onChange: (urls: string[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = 3 - images.length
    if (remaining <= 0) return

    setUploadError("")
    setUploading(true)

    const toUpload = Array.from(files).slice(0, remaining)
    const newUrls: string[] = []

    for (const file of toUpload) {
      const fd = new FormData()
      fd.append("file", file)
      const result = await uploadReviewImage(fd)
      if ("error" in result) {
        setUploadError(result.error)
        break
      }
      newUrls.push(result.url)
    }

    setUploading(false)
    if (newUrls.length > 0) onChange([...images, ...newUrls])
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
        Photos <span className="text-on-surface-disabled/60 normal-case">(optional, up to 3)</span>
      </label>

      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-16 h-16 bg-surface-low overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-surface-lowest/80 text-on-surface flex items-center justify-center text-[10px] leading-none hover:bg-surface-lowest transition-colors"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < 3 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-16 h-16 border border-dashed border-surface-variant/50 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-on-surface-disabled hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="font-inter text-[9px]">…</span>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="font-inter text-[8px] tracking-[0.1em] uppercase">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploadError && (
        <p className="font-inter text-xs text-red-400">{uploadError}</p>
      )}
    </div>
  )
}

// ─── Submission form ─────────────────────────────────────────────────────────

function SubmitForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(5)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const result = await submitReview(productId, {
      author_name: name,
      author_email: email || undefined,
      rating,
      title: title || undefined,
      body,
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
    })

    setSubmitting(false)
    if (result.success) {
      setDone(true)
      onSubmitted()
    } else {
      setError(result.error ?? "Something went wrong")
    }
  }

  if (done) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-6 flex flex-col gap-2">
        <p className="font-inter text-sm font-medium text-primary">Review submitted</p>
        <p className="font-inter text-sm text-on-surface-variant">
          Thank you. Your review will appear after moderation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
          Your Rating
        </label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
            Name <span className="text-on-surface-disabled/60 normal-case">*</span>
          </label>
          <input
            required
            type="text"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-surface-low border border-surface-variant/40 text-on-surface text-sm px-3 py-2.5 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
            Email <span className="text-on-surface-disabled/60 normal-case">(optional)</span>
          </label>
          <input
            type="email"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Not displayed publicly"
            className="bg-surface-low border border-surface-variant/40 text-on-surface text-sm px-3 py-2.5 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
          Headline <span className="text-on-surface-disabled/60 normal-case">(optional)</span>
        </label>
        <input
          type="text"
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          className="bg-surface-low border border-surface-variant/40 text-on-surface text-sm px-3 py-2.5 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
          Your Review <span className="text-on-surface-disabled/60 normal-case">*</span>
        </label>
        <textarea
          required
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How does it wear, project, and last? Who would you recommend it to?"
          className="bg-surface-low border border-surface-variant/40 text-on-surface text-sm px-3 py-2.5 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
        <span className="font-inter text-[10px] text-on-surface-disabled text-right">
          {body.length}/2000
        </span>
      </div>

      <ImageUploadInput images={imageUrls} onChange={setImageUrls} />

      {error && (
        <p className="font-inter text-sm text-red-400">{error}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 font-inter text-[11px] tracking-[0.18em] uppercase font-bold px-6 py-3 bg-primary text-surface-lowest disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </form>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

type Props = {
  productId: string
  initialReviews: ProductReview[]
  initialStats: ReviewStats
}

export default function ProductReviews({
  productId,
  initialReviews,
  initialStats,
}: Props) {
  const [showForm, setShowForm] = useState(false)

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
                No reviews yet. Be the first.
              </p>
            )}
          </div>

          <button
            onClick={() => setShowForm((v) => !v)}
            className="font-inter text-[10px] tracking-[0.18em] uppercase font-bold px-5 py-2.5 border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
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

        {/* Submission form */}
        {showForm && (
          <div className="mb-10 border border-surface-variant/30 bg-surface-low p-6">
            <p className="font-grotesk font-semibold text-sm text-on-surface tracking-[0.05em] mb-5">
              LEAVE A REVIEW
            </p>
            <SubmitForm
              productId={productId}
              onSubmitted={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Reviews list */}
        {initialReviews.length > 0 ? (
          <div className="flex flex-col gap-0">
            {initialReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="font-inter text-sm text-on-surface-disabled border-t border-surface-variant/20 pt-6">
              No approved reviews yet.
            </p>
          )
        )}
      </div>
    </section>
  )
}
