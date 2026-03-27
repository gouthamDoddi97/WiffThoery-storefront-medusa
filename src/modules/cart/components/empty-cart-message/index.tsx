import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div className="py-40 flex flex-col gap-6 items-start" data-testid="empty-cart-message">
      <div className="w-1 h-12 bg-primary" />
      <span className="eyebrow text-on-surface-variant">YOUR COLLECTION</span>
      <h1 className="font-grotesk font-bold text-4xl text-on-surface tracking-[-0.02em]">
        Nothing here yet.
      </h1>
      <p className="font-inter text-sm text-on-surface-variant max-w-[400px] leading-relaxed">
        Your curation is empty. Start your olfactory journey — begin with the crowd pleasers
        or dive straight into niche.
      </p>
      <div className="flex gap-4 mt-2">
        <LocalizedClientLink href="/collections/crowd-pleasers">
          <button className="btn-primary">START WITH CROWD PLEASERS</button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/store">
          <button className="btn-ghost">BROWSE ALL</button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage

