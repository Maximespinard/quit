import { createFileRoute } from '@tanstack/react-router'
import { CalendarSummary } from '@/features/calendar/components/CalendarSummary'
import { MonthCalendar } from '@/features/calendar/components/MonthCalendar'
import { StepSpans } from '@/features/calendar/components/StepSpans'
import { patchCalendar } from '@/shared/domain/patch-calendar'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch } from '@/shared/utils/app-search'
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
            <PageHeader
              title={copy.title}
              back={<BackLink to="/" search={keepSearch} aria-label={copy.back} />}
            />
            {calendar === null ? (
              <p className="text-body text-muted">{copy.empty}</p>
            ) : (
              <div className="flex flex-col gap-2.5">
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
