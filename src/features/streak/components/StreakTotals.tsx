import type { Streak } from '@/shared/domain/derive'
import { Card } from '@/shared/ui/Card'
import { type FigureRow, FigureRows } from '@/shared/ui/FigureRows'
import { splitDuration } from '@/shared/utils/duration'
import { twoDigits } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

type StreakTotalsProps = {
  smokeFreeDays: number
  /** `null` until a relapse exists: before, it would only repeat the streak. */
  personalBest: Streak | null
}

const copy = strings.streak

/** What a lapse never takes away: the smoke-free days total and, once needed, the personal best. */
export function StreakTotals({ smokeFreeDays, personalBest }: StreakTotalsProps) {
  const best = personalBest === null ? null : splitDuration(personalBest.elapsedMs)
  const rows: FigureRow[] = [{ label: copy.smokeFreeDays, value: smokeFreeDays }]
  if (best !== null) {
    rows.push({ label: copy.personalBest, value: copy.duration(best.days, twoDigits(best.hours)) })
  }

  return (
    <Card title={copy.totals}>
      <FigureRows rows={rows} />
    </Card>
  )
}
