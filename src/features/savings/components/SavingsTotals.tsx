import { Link } from '@tanstack/react-router'
import { Card } from '@/shared/ui/Card'
import { FigureRows } from '@/shared/ui/FigureRows'
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
  return (
    <Card title={copy.totals}>
      {moneySavedCents === null || cigarettesNotSmoked === null ? (
        // Only a journal started before first launch asked for them lands here.
        <div className="flex flex-col items-start gap-2">
          <p className="text-body text-muted">{copy.unset}</p>
          <Link to="/settings" search={keepSearch} className="font-medium text-ink text-body">
            {copy.openSettings}
          </Link>
        </div>
      ) : (
        <FigureRows
          rows={[
            { label: copy.moneySaved, value: formatEuros(moneySavedCents) },
            { label: copy.cigarettesNotSmoked, value: formatCount(cigarettesNotSmoked) },
          ]}
        />
      )}
    </Card>
  )
}
