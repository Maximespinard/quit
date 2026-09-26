import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { FactHistory } from '@/features/history/components/FactHistory'
import { historyDays } from '@/features/history/utils/history-days'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/history/')({
  component: HistoryPage,
})

const copy = strings.history

function HistoryPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const { factEdited, factDeleted } = useLocation({ select: (location) => location.state })
  const notice = factDeleted === true ? copy.deleted : factEdited === true ? copy.edited : null

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const days = historyDays(journal)
        return (
          <AppShell>
            <div className="flex flex-col gap-2 pt-6">
              <h2 className="text-title">{copy.title}</h2>
              {/* Only a list has lines to touch: the empty state says it all by itself. */}
              {days.length > 0 ? <p className="text-body text-ink-soft">{copy.lead}</p> : null}
            </div>
            {notice !== null ? (
              <p role="status" className="text-body text-ink-soft">
                {notice}
              </p>
            ) : null}
            <FactHistory days={days} now={now} />
            <Link
              to="/"
              search={appSearch}
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              {copy.back}
            </Link>
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
