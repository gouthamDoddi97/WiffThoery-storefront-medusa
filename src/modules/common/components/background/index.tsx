import React from "react"

type Props = {
  src: string
  mobileSrc?: string
  alt?: string
}

const isVideo = (src: string) =>
  src.endsWith(".webm") || src.endsWith(".mp4") || src.endsWith(".ogg")

const Background = ({ src, mobileSrc, alt }: Props) => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    {isVideo(src) ? (
      <video
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        {mobileSrc && (
          <source src={mobileSrc} media="(max-width: 768px)" type="video/webm" />
        )}
        <source src={src} type="video/webm" />
      </video>
    ) : (
      <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
    )}
  </div>
)

export default Background