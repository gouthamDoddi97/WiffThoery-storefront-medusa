"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Background from "../background"
import LocalizedClientLink from "../localized-client-link"

interface CarouselProps {
  slides: {
    src: string
    mobileSrc?: string
    title: string
    description: string
    badge: string,
    fontColorPallette?: "light" | "dark"
  }[]
  autoPlay: boolean,
  autoPlayInterval: number,

}



const LinkCarousel = ( { slides, autoPlay, autoPlayInterval }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const activeSlide = useMemo(() => slides[selectedIndex % slides.length], [selectedIndex])

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) {
        return
      }

      emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  useEffect(() => {
    if (!emblaApi) {
      return
    }

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    onSelect()
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi])

  useEffect(() => {
    if (!autoPlay) {
      return
    }

    const timer = setInterval(() => {
      emblaApi?.scrollTo((emblaApi.selectedScrollSnap() + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [emblaApi, autoPlay, autoPlayInterval])

  const fontColor = activeSlide.fontColorPallette === "light" ? "text-white" : "text-ui-fg-base"

  return (
    <div className="w-full relative">
      <div
        className="embla overflow-hidden h-[80vh]"
        ref={emblaRef}
      >
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <article
              key={`${slide.title}-${index}`}
              className="flex-[0_0_100%] h-full"
            >
              <div className={`relative h-full overflow-hidden p-8 small:p-16 text-left ${fontColor}`}>
                <Background src={slide.src} mobileSrc={slide.mobileSrc} alt={slide.title} />
                <span className={`inline-flex items-center rounded-full bg-black/30 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-[0.2em] text-white`}>
                  {slide.badge}
                </span>
                <h3 className={`mt-5 text-3xl font-semibold ${fontColor}`}>
                  {slide.title}
                </h3>
                <p className={`mt-3 text-lg ${fontColor}`}>
                  {slide.description}
                </p>
                <LocalizedClientLink
                  href="/store"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/30 transition-all duration-200"
                >
                  Shop
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </LocalizedClientLink>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Dot navigation — overlaid at bottom centre */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              selectedIndex === index ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default LinkCarousel