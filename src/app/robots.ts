import { MetadataRoute } from "next"
import { getSiteURL } from "@lib/util/env"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteURL()
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/checkout", "/account/", "/cart"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
