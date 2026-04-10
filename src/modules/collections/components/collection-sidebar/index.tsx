"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const SORT_OPTIONS = [
  { value: "created_at", label: "Latest arrivals" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const

const LONGEVITY_OPTIONS = [
  { value: "low", label: "2–4 hrs" },
  { value: "medium", label: "4–8 hrs" },
  { value: "high", label: "8+ hrs" },
]

const SILLAGE_OPTIONS = [
  { value: "low", label: "Intimate" },
  { value: "medium", label: "Moderate" },
  { value: "high", label: "Powerful" },
]

export const NOTE_FAMILIES = [
  "Citrus",
  "Floral",
  "Woody",
  "Musky",
  "Spicy",
  "Fresh",
  "Sweet",
  "Fruity",
  "Amber",
  "Leather",
]

type Props = {
  sortBy: SortOptions
  longevity: string[]
  sillage: string[]
  notes: string[]
}

function CheckOption({
  label,
  checked,
  onClick,
}: {
  label: string
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 text-left transition-colors duration-150 ${
        checked ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <span
        className={`w-3 h-3 border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? "border-primary" : "border-surface-variant"
        }`}
      >
        {checked && <span className="w-1.5 h-1.5 bg-primary block" />}
      </span>
      <span className="font-inter text-[11px]">{label}</span>
    </button>
  )
}

function SidebarContent({
  sortBy,
  longevity,
  sillage,
  notes,
  setParam,
  toggleArray,
  clearAll,
}: {
  sortBy: SortOptions
  longevity: string[]
  sillage: string[]
  notes: string[]
  setParam: (name: string, value: string) => void
  toggleArray: (name: string, current: string[], value: string) => void
  clearAll: () => void
}) {
  const hasFilters = longevity.length > 0 || sillage.length > 0 || notes.length > 0
  const totalFilters = longevity.length + sillage.length + notes.length

  return (
    <div className="flex flex-col gap-7">
      {/* Sort */}
      <div className="flex flex-col gap-3">
        <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
          Sort by
        </span>
        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sortBy", opt.value)}
              className={`flex items-center gap-2 text-left font-inter text-[11px] transition-colors duration-150 ${
                sortBy === opt.value
                  ? "text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className={`block h-px flex-shrink-0 transition-all duration-200 ${
                  sortBy === opt.value ? "w-4 bg-primary" : "w-0"
                }`}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-surface-variant/20" />

      {/* Longevity */}
      <div className="flex flex-col gap-3">
        <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
          Longevity
        </span>
        <div className="flex flex-col gap-2.5">
          {LONGEVITY_OPTIONS.map((opt) => (
            <CheckOption
              key={opt.value}
              label={opt.label}
              checked={longevity.includes(opt.value)}
              onClick={() => toggleArray("longevity", longevity, opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-surface-variant/20" />

      {/* Projection */}
      <div className="flex flex-col gap-3">
        <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
          Projection
        </span>
        <div className="flex flex-col gap-2.5">
          {SILLAGE_OPTIONS.map((opt) => (
            <CheckOption
              key={opt.value}
              label={opt.label}
              checked={sillage.includes(opt.value)}
              onClick={() => toggleArray("sillage", sillage, opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-surface-variant/20" />

      {/* Notes */}
      <div className="flex flex-col gap-3">
        <span className="font-inter text-[9px] tracking-[0.25em] uppercase text-on-surface-disabled">
          Notes
        </span>
        <div className="flex flex-wrap gap-1.5">
          {NOTE_FAMILIES.map((family) => {
            const checked = notes.includes(family)
            return (
              <button
                key={family}
                onClick={() => toggleArray("notes", notes, family)}
                className={`font-inter text-[9px] tracking-[0.14em] uppercase px-2 py-1 border transition-colors duration-150 ${
                  checked
                    ? "border-primary text-primary"
                    : "border-surface-variant/40 text-on-surface-disabled hover:border-on-surface-disabled hover:text-on-surface-variant"
                }`}
              >
                {family}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <>
          <div className="h-px bg-surface-variant/20" />
          <button
            onClick={clearAll}
            className="font-inter text-[9px] tracking-[0.2em] uppercase text-on-surface-disabled hover:text-secondary transition-colors text-left"
          >
            Clear filters ({totalFilters})
          </button>
        </>
      )}
    </div>
  )
}

export default function CollectionSidebar({
  sortBy,
  longevity,
  sillage,
  notes,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const setParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) params.set(name, value)
      else params.delete(name)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const toggleArray = useCallback(
    (name: string, current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      const params = new URLSearchParams(searchParams)
      if (next.length > 0) params.set(name, next.join(","))
      else params.delete(name)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("longevity")
    params.delete("sillage")
    params.delete("notes")
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const totalFilters = longevity.length + sillage.length + notes.length

  const sharedProps = { sortBy, longevity, sillage, notes, setParam, toggleArray, clearAll }

  return (
    <>
      {/* ── Mobile: toggle button + collapsible panel ── */}
      <div className="small:hidden mb-6">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2.5 font-inter text-[10px] tracking-[0.2em] uppercase border border-surface-variant/40 px-4 py-2.5 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="14" y2="12" />
            <line x1="4" y1="18" x2="8" y2="18" />
          </svg>
          Filters & Sort
          {totalFilters > 0 && (
            <span className="bg-primary text-surface-lowest font-inter text-[8px] w-4 h-4 flex items-center justify-center flex-shrink-0">
              {totalFilters}
            </span>
          )}
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`ml-auto transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {mobileOpen && (
          <div className="mt-3 p-5 bg-surface-low border border-surface-variant/20">
            <SidebarContent {...sharedProps} />
          </div>
        )}
      </div>

      {/* ── Desktop: sticky left column ── */}
      <div className="hidden small:block w-[200px] flex-shrink-0 sticky top-24 self-start">
        <SidebarContent {...sharedProps} />
      </div>
    </>
  )
}
