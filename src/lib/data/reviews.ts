"use server"

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export type ProductReview = {
  id: string
  product_id: string
  author_name: string
  author_email: string | null
  rating: number
  title: string | null
  body: string
  is_approved: boolean
  created_at: string
}

export type ReviewStats = {
  total: number
  average: number | null
}

export type ReviewsResponse = {
  reviews: ProductReview[]
  stats: ReviewStats
}

export const getProductReviews = async (
  productId: string
): Promise<ReviewsResponse> => {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/reviews`,
      {
        cache: "no-store",
        headers: {
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
      }
    )

    if (!res.ok) return { reviews: [], stats: { total: 0, average: null } }

    const data = await res.json()
    return {
      reviews: data.reviews ?? [],
      stats: data.stats ?? { total: 0, average: null },
    }
  } catch {
    return { reviews: [], stats: { total: 0, average: null } }
  }
}

export const submitReview = async (
  productId: string,
  payload: {
    author_name: string
    author_email?: string
    rating: number
    title?: string
    body: string
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${productId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "",
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Submission failed" }))
      return { success: false, error: error ?? "Submission failed" }
    }

    return { success: true }
  } catch {
    return { success: false, error: "Network error. Please try again." }
  }
}
