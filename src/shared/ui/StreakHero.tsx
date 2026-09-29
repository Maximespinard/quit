import type { ReactNode } from 'react'
import { useLaunchEntrance } from '@/shared/hooks/useLaunchEntrance'
import { countUpAt } from '@/shared/utils/count-up'
import type { SplitDuration } from '@/shared/utils/duration'
import { formatClock } from '@/shared/utils/format'
import { HeroBackdrop } from './HeroBackdrop'

/** The hero's count-up plays when the app is opened, not each time home is shown again. */
const ENTRANCE_KEY = 'streak-hero'

type StreakHeroProps = {
  /** The streak, split into whole days and the hours, minutes and seconds past them. */
  duration: SplitDuration
  /** Copy for the figure, e.g. "jours de streak". Carries its own plural. */
  daysLabel: string
  /** Stable name for the region, independent of the figure's plural. */
  regionLabel: string
  /** Top-left brand mark. */
  brand: ReactNode
  /** Top-right context, e.g. the current protocol step. */
  context?: ReactNode
  /** Optional control rendered after the context (settings). */
  action?: ReactNode
}

/**
 * The navy block that opens the home screen: one huge figure, one label row. On opening the
 * app, the days and the clock count up together and land on the same step: one gesture.
 */
export function StreakHero({
  duration,
  daysLabel,
  regionLabel,
  brand,
  context,
  action,
}: StreakHeroProps) {
  const { days, hours, minutes, seconds } = duration
  const progress = useLaunchEntrance(ENTRANCE_KEY)

  return (
    <section
      aria-label={regionLabel}
      className="relative isolate overflow-hidden rounded-b-hero bg-ink px-safe pt-safe text-on-ink"
    >
      <HeroBackdrop />
      <div className="relative flex min-h-14 items-center justify-between gap-3 pt-3">
        <h1 className="font-semibold text-label">{brand}</h1>
        <span className="flex items-center gap-2 text-label text-on-ink/80">
          {context}
          {action}
        </span>
      </div>
      <div className="relative flex flex-col items-center gap-1 pt-6 pb-9 text-center">
        <p className="text-display">
          <span className="sr-only">{days} </span>
          <span aria-hidden="true">{countUpAt(days, progress)}</span>
        </p>
        <span className="text-body">{daysLabel}</span>
        <span className="mt-1 text-figure">
          <span className="sr-only">{formatClock(hours, minutes, seconds)}</span>
          <span aria-hidden="true">
            {formatClock(
              countUpAt(hours, progress),
              countUpAt(minutes, progress),
              countUpAt(seconds, progress),
            )}
          </span>
        </span>
      </div>
    </section>
  )
}
