import { getBaseURL, getMediaURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

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
    siteName: "Whiff Theory",
    locale: "en_IN",
    images: [{ url: "/og-image.png", alt: "Whiff Theory – Curated Fragrance Collections", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/favicon.svg",
  },
  // og:video is not in Next.js's typed API — injected via `other`
  // Upload og-video.mp4 to your R2 bucket and set MEDUSA_CLOUD_S3_HOSTNAME
  other: {
    "og:video": `${getMediaURL()}/og-video.mp4`,
    "og:video:secure_url": `${getMediaURL()}/og-video.mp4`,
    "og:video:type": "video/mp4",
    "og:video:width": "1280",
    "og:video:height": "720",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
