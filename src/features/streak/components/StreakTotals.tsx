import { useId } from 'react'
import type { Streak } from '@/shared/domain/derive'
import { splitDuration } from '@/shared/utils/duration'
import { twoDigits } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

type StreakTotalsProps = {
  smokeFreeDays: number
  /** `null` until a lapse exists: then it would only repeat the streak. */
  personalBest: Streak | null
}

const copy = strings.streak

/** What a lapse never takes away: the smoke-free days total and, once needed, the personal best. */
export function StreakTotals({ smokeFreeDays, personalBest }: StreakTotalsProps) {
  const titleId = useId()
  const best = personalBest === null ? null : splitDuration(personalBest.elapsedMs)

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <h2 id={titleId} className="sr-only">
        {copy.totals}
      </h2>
      <dl className="grid grid-flow-col auto-cols-fr gap-3">
        <div className="flex flex-col gap-1 rounded-card bg-surface p-4">
          <dt className="text-ink-dim text-label">{copy.smokeFreeDays}</dt>
          <dd className="text-figure tabular-nums">{smokeFreeDays}</dd>
        </div>
        {best !== null ? (
          <div className="flex flex-col gap-1 rounded-card bg-surface p-4">
            <dt className="text-ink-dim text-label">{copy.personalBest}</dt>
            <dd className="text-figure tabular-nums">
              {copy.duration(best.days, twoDigits(best.hours))}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}
