import type { ReactNode } from 'react'
import { useCountUp } from '@/shared/hooks/useCountUp'

type StreakHeroProps = {
  /** Whole smoke-free days in the current streak. */
  days: number
  /** Hours and minutes past the last whole day. */
  hours: number
  minutes: number
  /** Copy for the figure, e.g. "jours sans fumer". */
  daysLabel: string
  /** Top-left brand mark. */
  brand: string
  /** Top-right context, e.g. the current protocol step. */
  context: ReactNode
  /** Optional control rendered after the context (settings). */
  action?: ReactNode
}

const pad = (n: number) => n.toString().padStart(2, '0')

/** The navy block that opens the home screen: one huge figure, one label row. */
export function StreakHero({
  days,
  hours,
  minutes,
  daysLabel,
  brand,
  context,
  action,
}: StreakHeroProps) {
  const shown = useCountUp(days)

  return (
    <section aria-label={daysLabel} className="rounded-b-hero bg-ink px-safe pt-safe text-on-ink">
      <div className="flex min-h-14 items-center justify-between gap-3 pt-3">
        <h1 className="font-semibold text-label">{brand}</h1>
        <span className="flex items-center gap-2 text-label text-on-ink/80">
          {context}
          {action}
        </span>
      </div>
      <p className="-ml-1 mt-5 text-display">
        <span className="sr-only">{days} </span>
        <span aria-hidden="true">{shown}</span>
      </p>
      <div className="flex items-baseline justify-between pt-2 pb-7">
        <span className="text-body">{daysLabel}</span>
        <span className="text-figure">
          {pad(hours)} h {pad(minutes)}
        </span>
      </div>
    </section>
  )
}
