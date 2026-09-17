"use server"

export type Locale = {
  code: string
  name: string
}

/**
 * Locales are optional; this project does not expose /store/locales on the backend.
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  return null
}
