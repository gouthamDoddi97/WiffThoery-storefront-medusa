"use client"

import { useState } from "react"

export type TabDef = {
  key: string
  label: string
  /** Optional dot indicator shown when the tab has content (e.g. active offers) */
  hasIndicator?: boolean
}

type Props = {
  tabs: TabDef[]
  /** Each child corresponds to tabs[i] */
  children: React.ReactNode[]
}

export default function HomeTabs({ tabs, children }: Props) {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-surface-lowest border-b border-surface-variant/30">
      {/* ── tab bar ── */}
      <div className="content-container">
        <div className="flex items-end gap-0 border-b border-surface-variant/20">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActive(i)}
              className={[
                "relative flex items-center gap-1.5 px-5 py-4 font-inter text-[9px] tracking-[0.28em] uppercase transition-colors duration-200",
                active === i
                  ? "text-on-surface after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary"
                  : "text-on-surface-disabled hover:text-on-surface-variant",
              ].join(" ")}
            >
              {tab.label}
              {tab.hasIndicator && (
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── active panel ── */}
      <div className="py-6 overflow-hidden">
        {children[active] ?? null}
      </div>
    </section>
  )
}
