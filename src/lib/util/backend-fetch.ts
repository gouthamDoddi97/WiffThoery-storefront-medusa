export function isBackendConnectionError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : ""

  const cause = (error as { cause?: { code?: string } })?.cause
  const code = cause?.code ?? ""

  return (
    /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(message) ||
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    code === "ETIMEDOUT"
  )
}

export function backendUnreachableMessage(): string {
  const backend = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  return `Cannot reach Medusa backend at ${backend}. Start whiff-theory (npm run dev) and wait for "Server is ready on port: 9000".`
}
