import { strings } from '@/shared/utils/strings'
import { CigaretteMark, CravingMark, PatchMark } from './DayMarks'

const copy = strings.calendar.legend

const items = [
  { id: 'logged', mark: <PatchMark patch="logged" />, label: copy.logged },
  { id: 'missing', mark: <PatchMark patch="missing" />, label: copy.missing },
  { id: 'due', mark: <PatchMark patch="due" />, label: copy.due },
  { id: 'planned', mark: <PatchMark patch="planned" />, label: copy.planned },
  { id: 'cigarette', mark: <CigaretteMark />, label: copy.cigarette },
  { id: 'craving', mark: <CravingMark />, label: copy.craving },
]

/** What each mark of the month grid stands for. Hidden from screen readers: each day says it. */
export function CalendarLegend() {
  return (
    <ul aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-2 text-muted text-label">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-1.5">
          <span className="grid size-3 place-items-center text-ink">{item.mark}</span>
          {item.label}
        </li>
      ))}
    </ul>
  )
}
