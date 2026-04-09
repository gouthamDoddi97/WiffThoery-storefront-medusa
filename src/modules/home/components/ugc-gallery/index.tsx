import { listUgcGalleryPhotos } from "@lib/data/ugc-gallery"
import FadeIn from "@modules/common/components/fade-in"

export default async function UGCGallery() {
  const photos = await listUgcGalleryPhotos()

  return (
    <section className="bg-surface-lowest py-24" aria-label="Community Gallery">
      <div className="content-container flex flex-col gap-10">

        {/* Heading */}
        <FadeIn className="flex flex-col small:flex-row small:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">#whifftheory</span>
            <h2 className="font-garamond italic font-normal text-3xl small:text-4xl text-on-surface tracking-[-0.01em]">
              From Your Shelves.
            </h2>
          </div>
          <a
            href="https://instagram.com/whifftheory"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5 font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300 self-start small:self-auto"
          >
            <span
              className="block h-px bg-current transition-all duration-500 group-hover:w-6"
              style={{ width: "14px" }}
            />
            Share your collection
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </FadeIn>

        {/* Photo grid */}
        <FadeIn delay={150}>
          <div className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-5 gap-px bg-surface-variant/10">
            {photos.length === 0 ? (
              <div className="col-span-5 text-center text-on-surface-variant py-12">
                No community photos yet.
              </div>
            ) : (
              photos.map((item, index) => (
                <a
                  key={item.id}
                  href="https://instagram.com/whifftheory"
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative aspect-square overflow-hidden bg-surface-low${index >= 4 ? " hidden small:block" : ""}`}
                  aria-label={item.alt_text ?? `Community photo ${index + 1}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.alt_text ?? `Community photo ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-surface-lowest/50 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
                    <svg
                      width="22" height="22" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="1.2"
                      strokeLinecap="square" className="text-primary"
                    >
                      <rect x="2" y="2" width="20" height="20"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </div>
                </a>
              ))
            )}
          </div>
        </FadeIn>

      </div>
    </section>
  )
}
