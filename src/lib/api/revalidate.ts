import { NextRequest } from "next/server"

const SECRET = process.env.REVALIDATE_SECRET

export const isRevalidateAuthorized = async (request: Request | NextRequest) => {
  console.log("Authorizing revalidation request...")
  if (!SECRET) {
    return false
  }

  const headerSecret = request.headers.get("x-revalidate-secret")
  if (headerSecret === SECRET) {
    return true
  }

  try {
    const body = await request.json()
    return body?.secret === SECRET
  } catch {
    return false
  }
}