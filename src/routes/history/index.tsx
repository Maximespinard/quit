import { createFileRoute, useLocation } from '@tanstack/react-router'
import { CravingLauncher } from '@/features/craving/components/CravingLauncher'
import { FactHistory } from '@/features/history/components/FactHistory'
import { historyDays } from '@/features/history/utils/history-days'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/AppShell'
import { BackLink, PageHeader } from '@/shared/ui/PageHeader'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { keepSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/history/')({
  component: HistoryPage,
})

const copy = strings.history

function HistoryPage() {
  const { state, now } = useJournalSource()
  const { factEdited, factDeleted } = useLocation({ select: (location) => location.state })
  const notice = factDeleted === true ? copy.deleted : factEdited === true ? copy.edited : null

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const days = historyDays(journal)
        return (
          <AppShell>
            {/* Only a list has lines to touch: the empty state says it all by itself. */}
            <PageHeader
              title={copy.title}
              {...(days.length > 0 ? { lead: copy.lead } : {})}
              back={<BackLink to="/" search={keepSearch} aria-label={copy.back} />}
            />
            {notice !== null ? (
              <p role="status" className="text-body text-muted">
                {notice}
              </p>
            ) : null}
            <FactHistory days={days} now={now} />
            <CravingLauncher journal={journal} now={now} />
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
