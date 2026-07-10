"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return
    const params = new URLSearchParams(searchParams)
    if (newPage === 1) {
      params.delete("page")
    } else {
      params.set("page", newPage.toString())
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div
      className="flex items-center justify-between mt-12"
      data-testid={dataTestid}
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="group flex items-center gap-3 font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant disabled:opacity-20 hover:text-on-surface transition-colors duration-200"
      >
        <span className="flex items-center justify-center w-10 h-10 border border-surface-variant group-hover:border-on-surface-variant group-disabled:border-surface-variant transition-colors duration-200">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 5 5 12 12 19" />
          </svg>
        </span>
        PREV
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1
          const isCurrent = p === page
          return (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-label={`Page ${p}`}
              aria-current={isCurrent ? "page" : undefined}
              className={`min-w-[2rem] h-8 px-2 font-inter text-[10px] tracking-[0.14em] transition-colors duration-200 ${
                isCurrent
                  ? "text-primary font-semibold border-b-2 border-primary"
                  : "text-on-surface-disabled hover:text-on-surface-variant"
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="group flex items-center gap-3 font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant disabled:opacity-20 hover:text-on-surface transition-colors duration-200"
      >
        NEXT
        <span className="flex items-center justify-center w-10 h-10 border border-surface-variant group-hover:border-on-surface-variant transition-colors duration-200">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </button>
    </div>
  )
}
