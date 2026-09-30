import { createFileRoute } from '@tanstack/react-router'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/AppShell'
import { CancelLink } from '@/shared/ui/CancelLink'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/lapse')({
  component: LapsePage,
})

function LapsePage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const recorded = useCommitThenHome(appSearch, 'lapseRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <LapseForm
            journal={journal}
            now={now}
            onRecorded={recorded}
            secondary={
              <CancelLink to="/" search={appSearch}>
                {strings.lapse.cancel}
              </CancelLink>
            }
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
