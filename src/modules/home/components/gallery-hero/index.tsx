import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Ivory Gallery hero — static split hero matching the fableRedesign mockup:
 * headline left, packaging photograph right, on the ivory paper shell.
 */
export default function GalleryHero() {
  return (
    <section className=" rule-ink small:h-[50vh] small:max-h-[50vh] small:overflow-hidden">
      <div className="content-container small:h-full">
        <div className="grid grid-cols-1 small:grid-cols-2 gap-10 small:gap-12 items-center small:items-stretch small:h-full small:min-h-0">
          {/* Left — headline */}
          <div className="flex flex-col justify-center gap-6 w-full max-w-[540px] small:py-2">
            <h1
              className="font-garamond serif-display font-medium text-on-surface leading-[1.04] tracking-[-0.01em]"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", fontStyle: "normal" }}
            >
              Indian stories,
              <br />
              bottled.
            </h1>

            <p className="font-inter text-base text-on-surface-variant leading-relaxed max-w-[380px]">
              Experience niche-quality fragrances without the niche price.
            </p>

            <div className="w-full">
              <LocalizedClientLink href="/store" className="block w-full small:inline-block">
                <button className="btn-ink !flex w-full small:!inline-flex small:w-auto uppercase justify-center">
                  Explore the collection
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </LocalizedClientLink>
            </div>
          </div>

          {/* Packaging photograph — below copy on mobile; fills column height on desktop */}
          <div className="relative aspect-[4/3] w-full order-last small:order-none small:aspect-auto small:h-full small:min-h-0">
            <Image
              src="/hero-boxes.png"
              alt="Whiff Theory perfume boxes — Passion and Petalina, illustrated packaging on ivory linen"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
