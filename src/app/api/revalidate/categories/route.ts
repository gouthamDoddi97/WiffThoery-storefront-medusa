import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { isRevalidateAuthorized } from "@lib/api/revalidate"

export async function POST(request: Request) {
  if (!(await isRevalidateAuthorized(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  console.log("Revalidating categories cache...")
  revalidateTag("categories")

  return NextResponse.json({ revalidated: true })
}

export async function GET(request: Request) {
  return POST(request)
}
