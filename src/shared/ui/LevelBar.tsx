type LevelBarProps = {
  /** Accessible name, e.g. "XP du niveau 4". */
  label: string
  xpIntoLevel: number
  xpForLevel: number
}

/** A thin bar with numeric endpoints: progress is a number, never a gauge. */
export function LevelBar({ label, xpIntoLevel, xpForLevel }: LevelBarProps) {
  const ratio = xpForLevel === 0 ? 0 : Math.min(1, xpIntoLevel / xpForLevel)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={xpForLevel}
      aria-valuenow={xpIntoLevel}
      className="h-2 overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full rounded-full bg-action transition-[width] duration-500 ease-out-expo motion-reduce:transition-none"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  )
}
