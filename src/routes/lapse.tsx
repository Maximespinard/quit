import { createFileRoute, Link } from '@tanstack/react-router'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { useLapseRecorded } from '@/features/lapse/hooks/useLapseRecorded'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
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
  const recorded = useLapseRecorded(appSearch)

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <LapseForm journal={journal} now={now} onRecorded={recorded} />
          <Link
            to="/"
            search={appSearch}
            className={buttonVariants({ variant: 'ghost', size: 'lg' })}
          >
            {strings.lapse.cancel}
          </Link>
        </AppShell>
      )}
    </ReadyJournal>
  )
}
