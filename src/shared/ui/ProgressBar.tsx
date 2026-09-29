type ProgressBarProps = {
  /** Accessible name, e.g. "XP du niveau 4". */
  label: string
  value: number
  max: number
  /** What a screen reader says instead of the raw value, e.g. `220,08 € sur 400 €`. */
  valueText?: string
}

/**
 * A thin bar with numeric endpoints: progress is a number, never a gauge. Level XP and the
 * goal's savings both read on it.
 */
export function ProgressBar({ label, value, max, valueText }: ProgressBarProps) {
  const ratio = max === 0 ? 0 : Math.min(1, value / max)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={valueText}
      className="h-2 overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out-expo motion-reduce:transition-none"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}
