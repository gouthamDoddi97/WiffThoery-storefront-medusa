"use client"

import { useState } from "react"

const ITEMS_PER_PAGE: Record<Layout, number> = {
  wave: 3,
  "s-curve": 4,
  scattered: 3,
  default: 4,
}

type Layout = "default" | "wave" | "s-curve" | "scattered"

const GRID_CLASSES: Record<Layout, string> = {
  wave: "grid grid-cols-1 w-full small:grid-cols-3 gap-x-8 gap-y-0 items-start pb-20",
  "s-curve": "flex flex-col gap-0 w-full",
  scattered: "grid grid-cols-2 w-full gap-x-8 gap-y-8 items-start",
  default: "grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-6 items-stretch",
}

function getItemClass(index: number, layout: Layout): string {
  if (layout === "wave") return index % 2 === 1 ? "mt-20" : ""
  if (layout === "scattered") return index === 2 ? "col-span-2" : ""
  return ""
}

export default function ProductSlider({
  items,
  layout,
}: {
  items: React.ReactNode[]
  layout: Layout
}) {
  const [page, setPage] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [visiblePage, setVisiblePage] = useState(0)

  const perPage = ITEMS_PER_PAGE[layout]
  const totalPages = Math.ceil(items.length / perPage)

  const navigate = (next: number) => {
    if (next < 0 || next >= totalPages || exiting) return
    setExiting(true)
    setTimeout(() => {
      setVisiblePage(next)
      setPage(next)
      setExiting(false)
    }, 220)
  }

  const visibleItems = items.slice(
    visiblePage * perPage,
    (visiblePage + 1) * perPage
  )

  return (
    <div>
      {/* Animated grid */}
      <div
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? "translateY(10px)" : "translateY(0)",
          transition: "opacity 220ms ease, transform 220ms ease",
        }}
      >
        {layout === "s-curve" ? (
          <div className={GRID_CLASSES[layout]} data-testid="products-list">
            {visibleItems.map((item, i) => (
              <div key={i}>{item}</div>
            ))}
          </div>
        ) : (
          <ul className={GRID_CLASSES[layout]} data-testid="products-list">
            {visibleItems.map((item, i) => (
              <li key={i} className={getItemClass(i, layout)}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-12">
          {/* Prev */}
          <button
            onClick={() => navigate(page - 1)}
            disabled={page === 0}
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

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(i)}
                aria-label={`Page ${i + 1}`}
                style={{ transition: "width 220ms ease, opacity 220ms ease" }}
                className={`h-[3px] rounded-none transition-all duration-200 ${
                  i === page
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-surface-variant hover:bg-on-surface-disabled"
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => navigate(page + 1)}
            disabled={page === totalPages - 1}
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
      )}
    </div>
  )
}
