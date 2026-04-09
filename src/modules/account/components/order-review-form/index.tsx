"use client"

import { useState, useRef } from "react"
import { submitReview, uploadReviewImage } from "@lib/data/reviews"

// ─── Star input ───────────────────────────────────────────────────────────────

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
          className="text-xl leading-none transition-colors"
          style={{ color: s <= display ? "#FFB547" : "rgba(255,255,255,0.2)" }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ─── Image upload ─────────────────────────────────────────────────────────────

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
    const newUrls: string[] = []
    for (const file of Array.from(files).slice(0, remaining)) {
      const fd = new FormData()
      fd.append("file", file)
      const result = await uploadReviewImage(fd)
      if ("error" in result) { setUploadError(result.error); break }
      newUrls.push(result.url)
    }
    setUploading(false)
    if (newUrls.length > 0) onChange([...images, ...newUrls])
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
        Photos <span className="normal-case text-on-surface-disabled/60">(optional, up to 3)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-14 h-14 bg-surface-low overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-surface-lowest/80 text-on-surface flex items-center justify-center text-[10px] leading-none"
              aria-label="Remove"
            >×</button>
          </div>
        ))}
        {images.length < 3 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-14 h-14 border border-dashed border-surface-variant/50 hover:border-primary/50 flex flex-col items-center justify-center gap-0.5 text-on-surface-disabled hover:text-primary transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="font-inter text-[9px]">…</span>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="font-inter text-[8px] uppercase">Add</span>
              </>
            )}
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only"
        onChange={(e) => handleFiles(e.target.files)} />
      {uploadError && <p className="font-inter text-xs text-red-400">{uploadError}</p>}
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

type Props = {
  productId: string
  productTitle: string
  onClose: () => void
}

export default function OrderReviewForm({ productId, productTitle, onClose }: Props) {
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
    if (result.success) setDone(true)
    else setError(result.error ?? "Something went wrong")
  }

  if (done) {
    return (
      <div className="border border-primary/30 bg-primary/5 p-4 flex flex-col gap-2">
        <p className="font-inter text-sm font-medium text-primary">Review submitted</p>
        <p className="font-inter text-xs text-on-surface-variant">Thank you. It will appear after moderation.</p>
        <button onClick={onClose} className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-variant hover:text-primary transition-colors mt-1 text-left">
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="border border-surface-variant/30 bg-surface-low p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-grotesk font-semibold text-xs tracking-[0.1em] uppercase text-on-surface">
          Review: {productTitle}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-on-surface-disabled hover:text-on-surface transition-colors text-lg leading-none"
          aria-label="Close"
        >×</button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">Rating</label>
          <StarInput value={rating} onChange={setRating} />
        </div>

        <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
              Name <span className="normal-case text-on-surface-disabled/60">*</span>
            </label>
            <input required type="text" maxLength={100} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-surface-container border border-surface-variant/40 text-on-surface text-sm px-3 py-2 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
              Email <span className="normal-case text-on-surface-disabled/60">(optional)</span>
            </label>
            <input type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Not shown publicly"
              className="bg-surface-container border border-surface-variant/40 text-on-surface text-sm px-3 py-2 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
            Headline <span className="normal-case text-on-surface-disabled/60">(optional)</span>
          </label>
          <input type="text" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            className="bg-surface-container border border-surface-variant/40 text-on-surface text-sm px-3 py-2 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
            Review <span className="normal-case text-on-surface-disabled/60">*</span>
          </label>
          <textarea required maxLength={2000} rows={3} value={body} onChange={(e) => setBody(e.target.value)}
            placeholder="How does it wear, project, and last?"
            className="bg-surface-container border border-surface-variant/40 text-on-surface text-sm px-3 py-2 placeholder:text-on-surface-disabled focus:outline-none focus:border-primary/50 transition-colors resize-none" />
          <span className="font-inter text-[10px] text-on-surface-disabled text-right">{body.length}/2000</span>
        </div>

        <ImageUploadInput images={imageUrls} onChange={setImageUrls} />

        {error && <p className="font-inter text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={submitting}
          className="self-start font-inter text-[10px] tracking-[0.18em] uppercase font-bold px-5 py-2.5 bg-primary text-surface-lowest disabled:opacity-50 hover:opacity-90 transition-opacity">
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
