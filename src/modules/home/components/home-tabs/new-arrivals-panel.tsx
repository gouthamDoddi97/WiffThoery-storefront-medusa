import { CarouselSlide } from "@modules/home/components/featured-products/collection-carousel"
import CollectionCarousel from "@modules/home/components/featured-products/collection-carousel"

export default function NewArrivalsPanel({
  slides,
}: {
  slides: CarouselSlide[]
}) {
  if (!slides.length) {
    return (
      <div className="content-container py-4">
        <p className="font-inter text-xs text-on-surface-disabled">No new arrivals right now.</p>
      </div>
    )
  }

  return (
    <CollectionCarousel
      slides={slides}
      collectionHandle="new-arrivals"
      collectionTitle="New Arrivals"
    />
  )
}
