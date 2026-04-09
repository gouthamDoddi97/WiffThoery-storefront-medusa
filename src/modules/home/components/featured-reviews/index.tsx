import { getFeaturedReviews } from "@lib/data/reviews"
import FadeIn from "@modules/common/components/fade-in"
import type { ProductReview } from "@lib/data/reviews"

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className="text-[11px] leading-none"
          style={{ color: s <= rating ? "#FFB547" : "rgba(255,255,255,0.15)" }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function ReviewTile({ review, index }: { review: ProductReview; index: number }) {
  const hasImage = review.image_urls && review.image_urls.length > 0
  const firstImage = hasImage ? review.image_urls![0] : null

  return (
    <FadeIn delay={index * 80}>
      <div className="bg-surface-low flex flex-col h-full">
        {firstImage && (
          <div className="aspect-[4/3] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={firstImage}
              alt={`${review.author_name}'s review photo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-col gap-3 p-5 flex-1">
          <Stars rating={review.rating} />
          {review.title && (
            <p className="font-inter text-sm font-medium text-on-surface leading-snug">
              {review.title}
            </p>
          )}
          <p className="font-garamond italic text-base text-on-surface-variant leading-relaxed line-clamp-4 flex-1">
            &ldquo;{review.body}&rdquo;
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-surface-variant/20">
            <span className="font-inter text-[10px] tracking-[0.12em] uppercase text-on-surface-disabled">
              {review.author_name}
            </span>
            <span className="font-inter text-[10px] text-on-surface-disabled">
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

export default async function FeaturedReviews() {
  const reviews = await getFeaturedReviews(8)

  if (reviews.length === 0) return null

  return (
    <section className="bg-surface-lowest py-24" aria-label="Customer Reviews">
      <div className="content-container flex flex-col gap-10">

        {/* Heading */}
        <FadeIn className="flex flex-col small:flex-row small:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">WHAT PEOPLE SAY</span>
            <h2 className="font-garamond italic font-normal text-3xl small:text-4xl text-on-surface tracking-[-0.01em]">
              From Those Who Wear It.
            </h2>
          </div>
        </FadeIn>

        {/* Review grid */}
        <div className="grid grid-cols-1 xsmall:grid-cols-2 small:grid-cols-3 large:grid-cols-4 gap-px bg-surface-variant/10">
          {reviews.map((review, i) => (
            <ReviewTile key={review.id} review={review} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
