import { getBaseURL, getMediaURL, getSiteURL } from "@lib/util/env"
import { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "styles/globals.css"

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
  icons: {
    icon: "/favicon.svg",
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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} dark`}
    >
      <body className="bg-surface-lowest text-on-surface">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
