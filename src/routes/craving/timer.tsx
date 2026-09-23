import { createFileRoute, Navigate } from '@tanstack/react-router'
import { CravingTimerScreen } from '@/features/craving/components/CravingTimerScreen'
import { useCravingRecorded } from '@/features/craving/hooks/useCravingRecorded'
import { validateCravingTimerSearch } from '@/features/craving/utils/timer-search'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'

export const Route = createFileRoute('/craving/timer')({
  validateSearch: validateCravingTimerSearch,
  component: CravingTimerPage,
})

function CravingTimerPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { state, now } = useJournalSource()
  const recorded = useCravingRecorded(search)

  if (search.startedAt === undefined)
    return <Navigate to="/" search={validateAppSearch(search)} replace />
  const { startedAt } = search

  const stop = () =>
    void navigate({ search: (prev) => ({ ...prev, stoppedAt: now }), replace: true })

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <CravingTimerScreen
            journal={journal}
            now={now}
            startedAt={startedAt}
            stoppedAt={search.stoppedAt ?? null}
            onStop={stop}
            onRecorded={recorded}
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
