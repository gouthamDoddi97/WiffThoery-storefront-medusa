import React from "react"

type Props = {
  src: string
  alt?: string
}

const isVideo = (src: string) =>
  src.endsWith(".webm") || src.endsWith(".mp4") || src.endsWith(".ogg")

const Background = ({ src, alt }: Props) => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    {isVideo(src) ? (
      <video
        src={src}
        className="h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      />
    ) : (
      <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
    )}
  </div>
)

export default Background