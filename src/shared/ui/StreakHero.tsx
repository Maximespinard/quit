import type { ReactNode } from 'react'
import { countUpAt } from '@/shared/utils/count-up'
import type { SplitDuration } from '@/shared/utils/duration'
import { twoDigits } from '@/shared/utils/format'
import { streakFigureSize } from '@/shared/utils/streak-figure'
import { strings } from '@/shared/utils/strings'
import { TopBar } from './TopBar'

type StreakHeroProps = {
  /** The streak, split into whole days and the hours and minutes past them (seconds unshown). */
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

const clock = (hours: number, minutes: number) =>
  strings.streak.clock(twoDigits(hours), twoDigits(minutes))

/**
 * The block that opens the home screen: the top bar, one huge white figure, one label line.
 * It sits on the haze its parent draws. During the entrance the days and the clock count up
 * together and land on the same step: one gesture. The figure is sized to the hero's width,
 * smaller from a third digit so it never runs past the insets.
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
  const { days, hours, minutes } = duration

  return (
    // Its own size container, padding-free: the figure's `cqi` is a share of the full column.
    <section aria-label={regionLabel} className="@container pt-safe text-ink">
      <div className="px-safe">
        <TopBar brand={brand} action={action}>
          {context}
        </TopBar>
      </div>
      <div className="flex flex-col items-center gap-3 px-safe pt-16 text-center">
        <p className="text-display text-white" style={{ fontSize: streakFigureSize(days) }}>
          <span className="sr-only">{days} </span>
          <span aria-hidden="true">{countUpAt(days, entrance)}</span>
        </p>
        <span className="text-lead">
          {daysLabel}{' '}
          <span className="text-muted">
            <span className="sr-only">{clock(hours, minutes)}</span>
            {/* The separator is drawn, not read: the label and the clock stay one phrase. */}
            <span aria-hidden="true" className="before:content-['·_']">
              {clock(countUpAt(hours, entrance), countUpAt(minutes, entrance))}
            </span>
          </span>
        </span>
      </div>
    </section>
  )
}
