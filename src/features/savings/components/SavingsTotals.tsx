import { Link } from '@tanstack/react-router'
import { useId } from 'react'
import { keepSearch } from '@/shared/utils/app-search'
import { formatEuros } from '@/shared/utils/euros'
import { formatCount } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

type SavingsTotalsProps = {
  /** `null` until the weekly spend and the baseline are both set. */
  moneySavedCents: number | null
  /** `null` until the baseline is set. */
  cigarettesNotSmoked: number | null
}

const copy = strings.savings

/** What stopping is worth so far: the money kept and the cigarettes left unsmoked. */
export function SavingsTotals({ moneySavedCents, cigarettesNotSmoked }: SavingsTotalsProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2.5">
      <h2 id={titleId} className="sr-only">
        {copy.totals}
      </h2>
      {moneySavedCents === null || cigarettesNotSmoked === null ? (
        // Only a journal started before first launch asked for them lands here.
        <div className="flex flex-col items-start gap-2 rounded-card bg-surface p-4">
          <p className="text-body text-muted">{copy.unset}</p>
          <Link to="/settings" search={keepSearch} className="font-medium text-ink text-body">
            {copy.openSettings}
          </Link>
        </div>
      ) : (
        // The same statement card as the totals above: one rule between equal columns.
        <dl className="grid auto-cols-fr grid-flow-col divide-x divide-line rounded-card bg-surface py-4">
          <div className="flex flex-col justify-between gap-1 px-4">
            <dt className="text-muted text-label">{copy.moneySaved}</dt>
            <dd className="text-figure tabular-nums">{formatEuros(moneySavedCents)}</dd>
          </div>
          <div className="flex flex-col justify-between gap-1 px-4">
            <dt className="text-muted text-label">{copy.cigarettesNotSmoked}</dt>
            <dd className="text-figure tabular-nums">{formatCount(cigarettesNotSmoked)}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
