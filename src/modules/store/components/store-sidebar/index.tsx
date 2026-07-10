"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import PriceText from "@modules/common/components/price-text"
import {
  FAMILY_OPTIONS,
  FilterCounts,
  MOOD_OPTIONS,
  PRICE_OPTIONS,
  TIER_OPTIONS,
} from "@modules/store/lib/store-filters"

const hairline = "color-mix(in srgb, var(--on-surface) 28%, transparent)"

type Props = {
  counts: FilterCounts
  tier: string[]
  family: string[]
  mood: string[]
  price: string[]
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-2.5">{children}</div>
      <div
        className="mt-6"
        style={{ borderTop: `var(--hairline-width) solid ${hairline}` }}
      />
    </div>
  )
}

function CheckRow({
  label,
  count,
  checked,
  onClick,
}: {
  label: React.ReactNode
  count: number
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-3 w-full text-left transition-colors ${
        checked ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-3 h-3 flex-shrink-0 flex items-center justify-center"
          style={{ border: `var(--hairline-width) solid ${hairline}` }}
        >
          {checked && (
            <span
              className="w-1.5 h-1.5 bg-on-surface block"
              aria-hidden
            />
          )}
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase truncate">
          {typeof label === "string" && label.includes("₹") ? (
            <PriceText>{label}</PriceText>
          ) : (
            label
          )}
        </span>
      </span>
      <span className="font-mono text-[10px] text-on-surface-muted flex-shrink-0">
        ({count})
      </span>
    </button>
  )
}

function SidebarPanel({
  counts,
  tier,
  family,
  mood,
  price,
  toggleArray,
  clearAll,
}: Props & {
  toggleArray: (name: string, current: string[], value: string) => void
  clearAll: () => void
}) {
  const hasFilters =
    tier.length > 0 ||
    family.length > 0 ||
    mood.length > 0 ||
    price.length > 0

  return (
    <div className="flex flex-col gap-6 pb-2">
      <FilterSection title="TIER">
        {TIER_OPTIONS.filter((opt) => counts.tier[opt.value] > 0).map((opt) => (
          <CheckRow
            key={opt.value}
            label={opt.label}
            count={counts.tier[opt.value]}
            checked={tier.includes(opt.value)}
            onClick={() => toggleArray("tier", tier, opt.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="FAMILY">
        {FAMILY_OPTIONS.filter((fam) => counts.family[fam] > 0).map((fam) => (
          <CheckRow
            key={fam}
            label={fam.toUpperCase()}
            count={counts.family[fam]}
            checked={family.includes(fam)}
            onClick={() => toggleArray("family", family, fam)}
          />
        ))}
      </FilterSection>

      <FilterSection title="MOOD">
        {MOOD_OPTIONS.filter((opt) => counts.mood[opt.value] > 0).map((opt) => (
          <CheckRow
            key={opt.value}
            label={opt.label}
            count={counts.mood[opt.value]}
            checked={mood.includes(opt.value)}
            onClick={() => toggleArray("mood", mood, opt.value)}
          />
        ))}
      </FilterSection>

      <div>
        <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-on-surface mb-4">
          PRICE
        </h3>
        <div className="flex flex-col gap-2.5">
          {PRICE_OPTIONS.filter((opt) => counts.price[opt.value] > 0).map((opt) => (
            <CheckRow
              key={opt.value}
              label={opt.label}
              count={counts.price[opt.value]}
              checked={price.includes(opt.value)}
              onClick={() => toggleArray("price", price, opt.value)}
            />
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="font-mono text-[9px] tracking-[0.2em] uppercase text-on-surface-muted hover:text-on-surface transition-colors text-left pt-2"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default function StoreSidebar(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleArray = useCallback(
    (name: string, current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      const params = new URLSearchParams(searchParams)
      params.delete("page")
      if (next.length > 0) params.set(name, next.join(","))
      else params.delete(name)
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("tier")
    params.delete("family")
    params.delete("mood")
    params.delete("price")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  const totalFilters =
    props.tier.length +
    props.family.length +
    props.mood.length +
    props.price.length

  return (
    <>
      <div className="small:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 text-on-surface-variant hover:text-on-surface transition-colors w-full"
          style={{ border: `var(--hairline-width) solid ${hairline}` }}
        >
          Filters
          {totalFilters > 0 && (
            <span className="font-mono text-[9px] text-on-surface-muted">
              ({totalFilters})
            </span>
          )}
        </button>
        {mobileOpen && (
          <div
            className="mt-3 p-5 bg-surface-lowest"
            style={{ border: `var(--hairline-width) solid ${hairline}` }}
          >
            <SidebarPanel
              {...props}
              toggleArray={toggleArray}
              clearAll={clearAll}
            />
          </div>
        )}
      </div>

      <aside
        className="hidden small:block w-[220px] flex-shrink-0 sticky top-24 self-start pr-8"
        style={{ borderRight: `var(--hairline-width) solid ${hairline}` }}
      >
        <SidebarPanel
          {...props}
          toggleArray={toggleArray}
          clearAll={clearAll}
        />
      </aside>
    </>
  )
}
