import { createFileRoute, Link } from '@tanstack/react-router'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/lapse')({
  component: LapsePage,
})

function LapsePage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const recorded = useRecordedThenHome(appSearch, 'lapseRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <LapseForm
            journal={journal}
            now={now}
            onRecorded={recorded}
            secondary={
              <Link
                to="/"
                search={appSearch}
                className={buttonVariants({ variant: 'ghost', size: 'lg' })}
              >
                {strings.lapse.cancel}
              </Link>
            }
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
