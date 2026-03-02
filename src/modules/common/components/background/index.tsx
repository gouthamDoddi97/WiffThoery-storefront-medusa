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
      <>
        {/* Desktop: video */}
        <video
          className={`h-full w-full object-cover ${mobileSrc ? "hidden sm:block" : ""}`}
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={src} type="video/webm" />
        </video>
        {/* Mobile: fallback image */}
        {mobileSrc && (
          <img
            src={mobileSrc}
            alt={alt ?? ""}
            className="h-full w-full object-cover sm:hidden"
          />
        )}
      </>
    ) : (
      <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" />
    )}
  </div>
)




export default Background