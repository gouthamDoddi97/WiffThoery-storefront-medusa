import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getSiteURL } from "@lib/util/env"

export const metadata: Metadata = {
  title: "Our Story | Whiff Theory",
  description:
    "The Whiff Theory story — crafted in Vizag, built on transparency, driven by a love of fragrance as art. India's most honest artisan perfume brand.",
  alternates: {
    canonical: `${getSiteURL()}/in/about`,
  },
  openGraph: {
    title: "Our Story | Whiff Theory",
    description:
      "Independent. Transparent. Crafted in Vizag. Learn how Whiff Theory became India's most honest fragrance brand.",
    images: [{ url: "/og-image.png", alt: "Whiff Theory – Our Story", width: 1200, height: 630 }],
    siteName: "Whiff Theory",
  },
  twitter: {
    card: "summary_large_image",
    site: "@whifftheory",
    title: "Our Story | Whiff Theory",
    description:
      "Independent. Transparent. Crafted in Vizag. India's most honest artisan fragrance brand.",
    images: ["/og-image.png"],
  },
}

export default function AboutPage() {
  const siteUrl = getSiteURL()

  const aboutSchema = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${siteUrl}/in/about#page`,
      name: "Our Story | Whiff Theory",
      description:
        "Whiff Theory is India's most transparent artisan fragrance brand, handcrafting luxury Eau de Parfum and Extrait perfumes in Visakhapatnam, Andhra Pradesh.",
      url: `${siteUrl}/in/about`,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/in` },
        { "@type": "ListItem", position: 2, name: "Our Story", item: `${siteUrl}/in/about` },
      ],
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <div className="bg-surface-lowest">

      {/* ── 1. Origin Hero ──────────────────────────────────────────────── */}
      <section className="relative py-28 small:py-40 bg-surface-low overflow-hidden">
        {/* Teal ambient */}
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(79,219,204,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="content-container relative z-10 flex flex-col small:flex-row gap-16 items-center">
          <div className="flex flex-col gap-6 flex-1 max-w-[580px]">
            <span className="eyebrow">OUR STORY</span>
              <h1 className="font-grotesk font-bold text-4xl small:text-6xl text-on-surface tracking-[-0.03em] leading-[0.95]">
                I once gifted a perfume.
              </h1>

              <p className="text-lg text-on-surface/70 leading-relaxed">
                Days later, in a quiet office, I caught its trail again — unexpectedly.
                It lingered in the air, but the moment stayed with me.
              </p>

              <p className="text-xl text-on-surface font-medium">
                That was the beginning.
              </p>

            <p className="font-inter text-base text-on-surface-variant leading-relaxed">
              Born on India&apos;s eastern coast. Built for those ready to wear something real.
            </p>
            <div className="w-12 h-[2px] bg-primary" />
          </div>

          <div className="flex-shrink-0 w-full small:w-[400px] aspect-[4/5] overflow-hidden bg-surface-container">
            <video
              src="/aboutHero.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── 2. The Independent Path ─────────────────────────────────────── */}
      <section className="py-24" id="story">
        <div className="content-container grid grid-cols-1 small:grid-cols-2 gap-16 items-start">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <span className="eyebrow">THE INDEPENDENT PATH</span>
            <h2 className="section-heading text-3xl">
              We didn't follow the playbook. There wasn't one worth following.
            </h2>
            <div className="flex flex-col gap-4 font-inter text-sm text-on-surface-variant leading-relaxed">
              <p>
                Whiff Theory started in Vizag with a single conviction: that Indians deserved access to
                genuine extrait-concentration fragrances without paying luxury-import premiums or settling
                for celebrity-endorsed mediocrity.
              </p>
              <p>
                No investor meetings. No distribution deals. No compromises. Just a team obsessed with
                olfactory art, transparent pricing, and building something that actually means something
                to the people who wear it. <em>Also, a few months of paychecks and credit card debt.</em>
              </p>
              <p>
                The three-tier ladder — Popular, Unique, IDGF — isn't a
                marketing segmentation exercise. It's a philosophy. Your nose grows. Your taste evolves.
                We built the brand around that journey.
              </p>
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Vizag.jpg"
            alt="Vizag coastline"
            className="aspect-square w-full object-cover sticky top-24"
          />
        </div>
      </section>

      {/* ── 3. What We Believe — 4 values cards ───────────────────────── */}
      <section className="bg-surface-low py-24" id="values">
        <div className="content-container flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">WHAT WE BELIEVE</span>
            <h2 className="section-heading text-3xl">Four principles. No exceptions.</h2>
          </div>

          <div className="grid grid-cols-1 xsmall:grid-cols-2 gap-px bg-surface-variant/20">
            {[
              {
                label: "ART IS NON-NEGOTIABLE",
                body: "Every label is an original piece of graphic art. The bottle you place on your shelf is a design object — not packaging. The art is the point.",
              },
              {
                label: "RESPECT THE BEGINNER",
                body: "Fragrance culture has too many gatekeepers. We write in plain language, price honestly, and meet you wherever you are on the journey.",
              },
              {
                label: "EARN THE NEXT PURCHASE",
                body: "We don't lock you in. No subscriptions, no bundles you didn't ask for. Each purchase should be good enough that you come back — on your terms.",
              },
              {
                label: "BUILT, NOT POLISHED",
                body: "We're an independent brand from Vizag, not a venture-backed fragrance house. What you see is real — the prices, the origins, the people behind it.",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-surface-low px-8 py-10 flex flex-col gap-4"
              >
                <div className="w-1 h-8 bg-primary" />
                <h3 className="font-grotesk font-bold text-sm tracking-[0.15em] uppercase text-on-surface">
                  {card.label}
                </h3>
                <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Vizag Section ────────────────────────────────────────────── */}
      <section className="py-24 bg-surface-container" id="sourcing">
        <div className="content-container grid grid-cols-1 small:grid-cols-2 gap-16 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bayOfbengal.jpeg"
            alt="Bay of Bengal, Vizag"
            className="aspect-[16/10] w-full object-cover"
          />

          <div className="flex flex-col gap-6">
            <span className="eyebrow">WHERE WE'RE FROM</span>
            <h2 className="section-heading text-3xl">
              Crafted in Vizag, for the world.
            </h2>
            <div className="flex flex-col gap-4 font-inter text-sm text-on-surface-variant leading-relaxed">
              <p>
                Vizag — Visakhapatnam — sits on the Bay of Bengal. It's a port city. A city of
                movement, of trade, of things arriving and departing. It shaped us.
              </p>
              <p>
                Our fragrances are conceptualised, blended, and bottled here. The label art is designed
                here. The brand exists here, not because it had to, but because we're proud of where
                we're from.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. The Pricing Truth ────────────────────────────────────────── */}
      <section className="py-24 bg-surface-lowest" id="pricing">
        <div className="content-container max-w-[800px]">
          <div className="flex flex-col gap-6">
            <span className="eyebrow text-secondary">TRANSPARENCY</span>
            <h2 className="font-grotesk font-bold text-3xl small:text-4xl text-secondary tracking-[-0.02em] leading-tight">
              THE PRICING TRUTH
            </h2>
            <div className="flex flex-col gap-4 font-inter text-sm text-on-surface-variant leading-relaxed">
              <p>
                Most fragrance brands charge you for the bottle, the celebrity, the airport boutique,
                and the marketing department. You're paying for all of that before a drop of fragrance
                reaches you.
              </p>
              <p>
                We charge you for ingredients, blending, packaging design, and a fair margin. That's it.
                Our fragrances are extrait concentration because we believe you should smell something
                real, and because diluting fragrance to add water is an insult to the craft.
              </p>
              <p>
                We publish what we can. We explain what we can't. If you ever wonder what you're paying
                for, ask us — we'll tell you.
              </p>
            </div>

            {/* Visual cost breakdown */}
            <div className="bg-surface-low p-8 flex flex-col gap-4 mt-4">
              <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-on-surface-variant">
                WHERE YOUR MONEY GOES
              </h3>
              {[
                { label: "Raw ingredients & blending", pct: 40 },
                { label: "Bottle & packaging design", pct: 25 },
                { label: "Operations & shipping", pct: 15 },
                { label: "Our margin (honestly)", pct: 20 },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-inter text-xs text-on-surface-variant">{item.label}</span>
                    <span className="font-inter text-xs text-primary">{item.pct}%</span>
                  </div>
                  <div className="h-px bg-surface-variant relative">
                    <div
                      className="absolute left-0 top-0 h-px bg-primary"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Journey CTA ──────────────────────────────────────────────── */}
      <section className="bg-surface-low py-24">
        <div className="content-container flex flex-col items-center text-center gap-8 max-w-[560px] mx-auto">
          <h2 className="section-heading text-3xl small:text-4xl">
            Ready to find your signature scent?
          </h2>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed">
            Start with what everybody loves, then evolve as far as curiosity takes you.
          </p>
          <div className="flex flex-col xsmall:flex-row gap-4">
            <LocalizedClientLink href="/categories/popular">
              <button className="btn-primary">START WITH POPULAR</button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/store">
              <button className="btn-ghost">EXPLORE ALL FRAGRANCES</button>
            </LocalizedClientLink>
          </div>
        </div>
      </section>

    </div>
    </>
  )
}
