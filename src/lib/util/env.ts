export const getBaseURL = () => {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000").replace(/\/$/, "")
}

export const getSiteURL = () => {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://localhost:8000"
  ).replace(/\/$/, "")
}

export const getMediaURL = () => {
  const hostname = process.env.MEDUSA_CLOUD_S3_HOSTNAME
  return hostname ? `https://${hostname}` : getBaseURL()
}
