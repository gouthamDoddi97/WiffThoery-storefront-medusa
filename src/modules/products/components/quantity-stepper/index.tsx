"use client"

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

const HAIRLINE = "var(--hairline-width) solid color-mix(in srgb, var(--on-surface) 24%, transparent)"

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <div
      className="inline-flex items-center h-10 rounded-sm overflow-hidden"
      style={{ border: HAIRLINE }}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-full font-mono text-base text-on-surface disabled:opacity-30 hover:bg-surface-low transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center font-mono text-sm text-on-surface">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-full font-mono text-base text-on-surface disabled:opacity-30 hover:bg-surface-low transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
