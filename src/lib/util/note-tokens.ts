/** Normalize a note name for fragrance-notes library lookup. */
export function normalizeNoteName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ")
}

/** Split a note layer string into individual note tokens. */
export function parseNoteTokens(notes?: string | null): string[] {
  if (!notes) return []
  return notes
    .split(/[,·]/)
    .flatMap((part) => part.split(/\band\b/i))
    .map((n) => n.trim().replace(/[.!?]+$/, "").trim())
    .filter(Boolean)
}

export function primaryNoteFromLayer(notes?: string | null): string {
  return parseNoteTokens(notes)[0] ?? ""
}
