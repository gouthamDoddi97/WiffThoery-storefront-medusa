import { listUgcGalleryPhotos } from "@lib/data/ugc-gallery"

export default async function UGCGallery() {
  const photos = await listUgcGalleryPhotos()

  return (
    <section className="bg-surface-lowest py-24" aria-label="Community Gallery">
      <div className="content-container flex flex-col gap-10">
        {/* Heading */}
        <div className="flex flex-col small:flex-row small:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="section-heading text-2xl small:text-3xl">
              WHERE DOES YOUR WHIFF THEORY LIVE?
            </h2>
            <span className="eyebrow">#WHIFFTHEORY</span>
          </div>
          <a
            href="https://instagram.com/whifftheory"
            target="_blank"
            rel="noreferrer"
            className="font-inter text-xs tracking-[0.15em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-200 flex items-center gap-2 self-start small:self-auto"
          >
            SHARE YOUR COLLECTION
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        {/* 5-photo grid */}
        <div className="grid grid-cols-2 small:grid-cols-3 large:grid-cols-5 gap-px bg-surface-variant/20">
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
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-surface-lowest/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" className="text-primary">
                    <rect x="2" y="2" width="20" height="20"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
