import fs from "fs/promises"
import path from "path"

const VLOG_DIR = path.join(process.cwd(), "src", "content", "scent-vlogs")

/** Match a product handle to the closest scent-vlogs/{handle}.md file. */
export async function resolveVlogHandle(handle: string): Promise<string | null> {
  const normalized = handle.trim().toLowerCase()
  if (!normalized) return null

  let stems: string[] = []
  try {
    const files = await fs.readdir(VLOG_DIR)
    stems = files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, "").toLowerCase())
  } catch {
    return null
  }

  if (stems.includes(normalized)) return normalized

  const firstSegment = normalized.split("-")[0]
  if (stems.includes(firstSegment)) return firstSegment

  const byPrefix = stems.find(
    (stem) => normalized.startsWith(`${stem}-`) || normalized.includes(stem)
  )
  if (byPrefix) return byPrefix

  return null
}

export async function readVlogMarkdown(handle: string): Promise<string | null> {
  const resolved = await resolveVlogHandle(handle)
  if (!resolved) return null

  try {
    const filePath = path.join(VLOG_DIR, `${resolved}.md`)
    return await fs.readFile(filePath, "utf-8")
  } catch {
    return null
  }
}

export async function hasVlogContent(handle: string): Promise<boolean> {
  return (await resolveVlogHandle(handle)) !== null
}
