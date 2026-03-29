export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-lowest px-6 py-24 small:py-32">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <span className="eyebrow mb-5 text-primary">LOADING WHIFF THEORY</span>
        <h1 className="font-grotesk text-3xl small:text-5xl font-semibold tracking-[-0.04em] text-on-surface">
          Preparing your fragrance experience
        </h1>
        <p className="mt-4 max-w-xl text-sm small:text-base leading-relaxed text-on-surface-variant">
          We&apos;re loading the home page, navigation, and featured collections.
          This can take a moment while images, videos, and product data finish
          arriving.
        </p>

        <div className="mt-12 w-full max-w-md rounded-full bg-surface-variant/20 p-2">
          <div className="relative h-3 overflow-hidden rounded-full bg-surface-variant/20">
            <div className="absolute inset-y-0 w-1/2 bg-primary animate-loading-bar" />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-on-surface-disabled">
          <span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Loading content
        </div>
      </div>
    </div>
  )
}
