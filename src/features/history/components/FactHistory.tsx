import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useId } from 'react'
import { keepSearch } from '@/shared/utils/app-search'
import { formatTime } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { dayHeading } from '../utils/day-heading'
import { describeFact } from '../utils/describe-fact'
import type { HistoryDay, HistoryEntry } from '../utils/history-days'

type FactHistoryProps = {
  days: readonly HistoryDay[]
  /** Injected clock: names today and yesterday. */
  now: number
}

/** Every recorded fact, newest first, by day; a row opens the fact to edit or delete it. */
export function FactHistory({ days, now }: FactHistoryProps) {
  if (days.length === 0) {
    return <p className="text-body text-ink-soft">{strings.history.empty}</p>
  }
  return (
    <div className="flex flex-col gap-6">
      {days.map(({ day, entries }) => (
        <HistoryDaySection key={day} heading={dayHeading(day, now)} entries={entries} />
      ))}
    </div>
  )
}

function HistoryDaySection({
  heading,
  entries,
}: {
  heading: string
  entries: readonly HistoryEntry[]
}) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-1">
      <h3 id={headingId} className="font-semibold text-ink-soft text-label first-letter:uppercase">
        {heading}
      </h3>
      <ul className="flex flex-col">
        {entries.map(({ index, fact }) => {
          const { title, detail } = describeFact(fact)
          return (
            <li key={index}>
              <Link
                to="/history/$position"
                params={{ position: String(index) }}
                search={keepSearch}
                className="-mx-2 flex min-h-14 items-center gap-4 rounded-control px-2 py-2 active:bg-surface"
              >
                <span className="w-12 shrink-0 font-medium text-body text-ink-soft tabular-nums">
                  {formatTime(fact.at)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold text-body">{title}</span>
                  <span className="truncate text-ink-soft text-label">{detail}</span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-dim" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
