const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME || "pub-e954515d20cd47a0b767bba302e9d2c4.r2.dev"

// Extract hostname from the backend URL so product/collection images load
const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || ""
let backendHostname = null
try {
  if (BACKEND_URL) backendHostname = new URL(BACKEND_URL).hostname
} catch {}

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pub-e954515d20cd47a0b767bba302e9d2c4.r2.dev",
      },
      ...(backendHostname
        ? [{ protocol: "https", hostname: backendHostname }]
        : []),
      ...(S3_HOSTNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
            },
          ]
        : []),
    ],
  },
}

module.exports = nextConfig
