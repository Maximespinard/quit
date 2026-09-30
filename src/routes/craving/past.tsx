import { createFileRoute } from '@tanstack/react-router'
import { PastCravingForm } from '@/features/craving/components/PastCravingForm'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { CancelLink } from '@/shared/ui/CancelLink'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/craving/past')({
  component: PastCravingPage,
})

function PastCravingPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const recorded = useCommitThenHome(appSearch, 'cravingRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <PastCravingForm
            journal={journal}
            now={now}
            onRecorded={recorded}
            secondary={
              <CancelLink to="/" search={appSearch}>
                {strings.craving.past.cancel}
              </CancelLink>
            }
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
