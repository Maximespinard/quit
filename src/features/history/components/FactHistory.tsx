import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useId } from 'react'
import { keepSearch } from '@/shared/utils/app-search'
import { formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { dayHeading } from '../utils/day-heading'
import { describeFact } from '../utils/describe-fact'
import type { HistoryDay, HistoryItem } from '../utils/history-days'

type FactHistoryProps = {
  days: readonly HistoryDay[]
  /** Injected clock: names today and yesterday. */
  now: number
}

/** Every recorded fact, newest first, by day; a row opens the fact to edit or delete it. */
export function FactHistory({ days, now }: FactHistoryProps) {
  if (days.length === 0) {
    return <p className="text-body text-muted">{strings.history.empty}</p>
  }
  return (
    <div className="flex flex-col gap-7">
      {days.map(({ day, items }) => (
        <HistoryDaySection key={day} heading={dayHeading(day, now)} items={items} />
      ))}
    </div>
  )
}

type HistoryDaySectionProps = {
  heading: string
  items: readonly HistoryItem[]
}

function HistoryDaySection({ heading, items }: HistoryDaySectionProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h3 id={headingId} className="font-medium text-body first-letter:uppercase">
        {heading}
      </h3>
      {/* One card a day, its facts split by hairlines, like the list card on the home. */}
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-card bg-surface">
        {items.map(({ index, fact }) => {
          const { title, detail } = describeFact(fact)
          return (
            <li key={index}>
              <Link
                to="/history/$factIndex"
                params={{ factIndex: String(index) }}
                search={keepSearch}
                // The time sits on the title's baseline; the chevron centres on the row. Pressed, the row
                // lifts to `ghost`; `muted` keeps its contrast there too.
                className="flex min-h-16 items-baseline gap-4 px-4 py-3 transition-colors duration-150 ease-out-expo focus-visible:-outline-offset-2 active:bg-ghost motion-reduce:transition-none"
              >
                <span className="w-11 shrink-0 text-body text-muted tabular-nums">
                  {formatTime(fact.at)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium text-body">{title}</span>
                  <span className="truncate text-label text-muted">{detail}</span>
                </span>
                <ChevronRight aria-hidden className="size-4.5 shrink-0 self-center text-muted" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
