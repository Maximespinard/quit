import { strings } from '@/shared/utils/strings'
import type { CravingBucket } from '../domain/craving-bucket'
import { cravingHeat } from '../utils/craving-heat'
import { CigaretteMark, PatchMark } from './DayMarks'

const copy = strings.calendar.legend

const buckets: readonly CravingBucket[] = [0, 1, 2, 3]

const items = [
  { id: 'missing', mark: <PatchMark patch="missing" />, label: copy.missing },
  { id: 'due', mark: <PatchMark patch="due" />, label: copy.due },
  { id: 'cigarette', mark: <CigaretteMark />, label: copy.cigarette },
]

/**
 * The craving scale of the lived days, then what each mark of the month grid stands for.
 * Hidden from screen readers: each day says it.
 */
export function CalendarLegend() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 text-label text-muted">
      <div className="flex items-center gap-2">
        {copy.less}
        <span className="flex gap-1">
          {buckets.map((bucket) => (
            <span
              key={bucket}
              className="size-4 rounded-sm"
              style={{ backgroundColor: cravingHeat[bucket] }}
            />
          ))}
        </span>
        {copy.more}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5">
            <span className="grid size-3.5 place-items-center text-ink">{item.mark}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
