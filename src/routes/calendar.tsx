import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { CalendarSummary } from '@/features/calendar/components/CalendarSummary'
import { MonthCalendar } from '@/features/calendar/components/MonthCalendar'
import { StepSpans } from '@/features/calendar/components/StepSpans'
import { patchCalendar } from '@/shared/domain/patch-calendar'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch } from '@/shared/utils/app-search'
import { cn } from '@/shared/utils/cn'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

const copy = strings.calendar

function CalendarPage() {
  const { state, now } = useJournalSource()

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const calendar = patchCalendar(journal, now)
        return (
          <AppShell>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                search={keepSearch}
                aria-label={copy.back}
                // Pulled into the gutter so the chevron, not its touch target, lines up with the text.
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), '-ml-3')}
              >
                <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <h2 className="text-title">{copy.title}</h2>
            </div>
            {calendar === null ? (
              <p className="text-body text-ink-soft">{copy.empty}</p>
            ) : (
              <div className="flex flex-col gap-8">
                <CalendarSummary
                  position={calendar.position}
                  nextStepChange={calendar.nextStepChange}
                  plannedEnd={calendar.plannedEnd}
                />
                <MonthCalendar days={calendar.days} now={now} />
                <StepSpans steps={calendar.steps} position={calendar.position} />
              </div>
            )}
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
