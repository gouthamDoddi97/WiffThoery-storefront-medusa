export default function medusaError(error: any): never {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message = error.response.data.message || error.response.data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + error.request)
  } else {
    const message = String(error.message ?? error)
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(message)) {
      const backend =
        process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
      throw new Error(
        `Cannot reach Medusa backend at ${backend}. Start the backend (npm run dev in whiff-theory) or check MEDUSA_BACKEND_URL.`
      )
    }
    throw new Error("Error setting up the request: " + message)
  }
}
