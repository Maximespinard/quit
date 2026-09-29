import { createFileRoute, Link } from '@tanstack/react-router'
import { PastCravingForm } from '@/features/craving/components/PastCravingForm'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/craving/past')({
  component: PastCravingPage,
})

function PastCravingPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const recorded = useRecordedThenHome(appSearch, 'cravingRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <PastCravingForm
            journal={journal}
            now={now}
            onRecorded={recorded}
            secondary={
              <Link
                to="/"
                search={appSearch}
                className={buttonVariants({ variant: 'ghost', size: 'lg' })}
              >
                {strings.craving.past.cancel}
              </Link>
            }
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
