import fs from "fs/promises"
import path from "path"
import { resolveVlogHandle } from "./scent-vlog"

export type LabLogEntry = {
  date: string
  text: string
}

/** Pull dated lab-log bullets from src/content/scent-vlogs/{handle}.md */
export async function readLabLogEntries(handle: string): Promise<LabLogEntry[]> {
  const resolved = await resolveVlogHandle(handle)
  if (!resolved) return []

  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "scent-vlogs",
      `${resolved}.md`
    )
    const md = await fs.readFile(filePath, "utf-8")
    const section = md.split(/##\s*Lab log/i)[1]?.split(/##/)[0] ?? ""

    return section
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => {
        const body = line.replace(/^-\s*/, "")
        const match = body.match(/^(DAY\s*\d+|[\d]{1,2}\s+[A-Z]{3,9}\s+[\d]{4})\s*[—–-]\s*(.+)$/i)
        if (match) {
          return { date: match[1].toUpperCase(), text: match[2].trim() }
        }
        return { date: "LOG", text: body }
      })
      .slice(0, 3)
  } catch {
    return []
  }
}
