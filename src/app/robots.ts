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
      // Explicitly allow AI citation/search bots (they may also match "*" but
      // being explicit ensures they are welcomed and not accidentally blocked
      // by future wildcard Disallow additions).
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      // Block Common Crawl — used only for AI training, does not power citations.
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
