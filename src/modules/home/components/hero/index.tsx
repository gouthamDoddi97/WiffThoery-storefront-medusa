import Carousel from "@modules/common/components/carousel"
import defaultSlides from "@lib/data/homeCarouselSlides";

type Slide = {
  src: string
  title: string
  description: string
  badge: string
  fontColorPallette?: "light" | "dark"
}

type HeroProps = {
  slides?: Slide[]
}

const Hero = ({ slides }: HeroProps) => {
  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides
  return (
    <div className="w-full border-b border-ui-border-base bg-ui-bg-subtle">
      <Carousel slides={activeSlides} autoPlay={true} autoPlayInterval={8000} />
      <div className="flex justify-center py-6">
        <h3 className="text-2xl font-semibold text-ui-fg-base">Explore our collections below</h3>
      </div>
    </div>
  )
}

export default Hero
