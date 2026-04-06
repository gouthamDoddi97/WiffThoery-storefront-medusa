import { getBaseURL, getMediaURL, getSiteURL } from "@lib/util/env"
import { Metadata } from "next"
import { Space_Grotesk, Inter, Cormorant_Garamond } from "next/font/google"
import "styles/globals.css"

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    template: "%s | Whiff Theory",
    default: "Whiff Theory",
  },
  description:
    "Discover luxury and artisan fragrances at Whiff Theory. Shop our curated collection of perfumes crafted for every mood and occasion.",
  openGraph: {
    type: "website",
    url: getSiteURL(),
    siteName: "Whiff Theory",
    locale: "en_IN",
    images: [{ url: "/og-image.png", alt: "Whiff Theory – Curated Fragrance Collections", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@whifftheory",
    creator: "@whifftheory",
    title: "Whiff Theory – Curated Fragrance Collections",
    description:
      "Discover luxury and artisan fragrances at Whiff Theory. Shop perfumes crafted for every mood and occasion.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  // og:video is not in Next.js's typed API — injected via `other`
  // Upload og-video.mp4 to your R2 bucket and set MEDUSA_CLOUD_S3_HOSTNAME
  other: {
    ...(process.env.NEXT_PUBLIC_FB_APP_ID
      ? { "fb:app_id": process.env.NEXT_PUBLIC_FB_APP_ID }
      : {}),
    "og:video": `${getMediaURL()}/og-video.mp4`,
    "og:video:secure_url": `${getMediaURL()}/og-video.mp4`,
    "og:video:type": "video/mp4",
    "og:video:width": "1280",
    "og:video:height": "720",
  },
}

// ── Sitewide structured data ──────────────────────────────────────────────────
// Organization + WebSite schema helps search engines and AI models understand
// brand identity, location, and site search capabilities.
const siteUrl = getSiteURL()

const sitewideSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Whiff Theory",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/Wlogo.png`,
        width: 512,
        height: 512,
      },
      description:
        "Whiff Theory is India's most transparent artisan fragrance brand, handcrafting luxury perfumes in Visakhapatnam, Andhra Pradesh.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Visakhapatnam",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.instagram.com/whifftheory",
        "https://www.facebook.com/whifftheory",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Whiff Theory",
      description:
        "Discover luxury and artisan fragrances at Whiff Theory. Curated perfume collections crafted for every mood and occasion.",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/in/store?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${spaceGrotesk.variable} ${inter.variable} dark`}
    >
      <body className="bg-surface-lowest text-on-surface">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitewideSchema) }}
        />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
