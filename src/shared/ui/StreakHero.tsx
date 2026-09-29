import type { ReactNode } from 'react'
import { countUpAt } from '@/shared/utils/count-up'
import type { SplitDuration } from '@/shared/utils/duration'
import { formatClock } from '@/shared/utils/format'
import { HeroBackdrop } from './HeroBackdrop'

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
  /** How far (0 to 1) the figures have counted up; the final values when left out. */
  entrance?: number
}

/**
 * The block that opens the home screen: one huge figure, one label row. During the
 * entrance the days and the clock count up together and land on the same step: one gesture.
 */
export function StreakHero({
  duration,
  daysLabel,
  regionLabel,
  brand,
  context,
  action,
  entrance = 1,
}: StreakHeroProps) {
  const { days, hours, minutes, seconds } = duration

  return (
    <section
      aria-label={regionLabel}
      className="relative isolate overflow-hidden rounded-b-hero bg-page px-safe pt-safe text-ink"
    >
      <HeroBackdrop />
      <div className="relative flex min-h-14 items-center justify-between gap-3 pt-3">
        <h1 className="font-semibold text-label">{brand}</h1>
        <span className="flex items-center gap-2 text-label">
          {context}
          {action}
        </span>
      </div>
      <div className="relative flex flex-col items-center gap-1 pt-6 pb-9 text-center">
        <p className="text-display text-white">
          <span className="sr-only">{days} </span>
          <span aria-hidden="true">{countUpAt(days, entrance)}</span>
        </p>
        <span className="text-body">{daysLabel}</span>
        <span className="mt-1 text-figure">
          <span className="sr-only">{formatClock(hours, minutes, seconds)}</span>
          <span aria-hidden="true">
            {formatClock(
              countUpAt(hours, entrance),
              countUpAt(minutes, entrance),
              countUpAt(seconds, entrance),
            )}
          </span>
        </span>
      </div>
    </section>
  )
}
