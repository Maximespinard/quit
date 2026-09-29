import { createFileRoute, Link } from '@tanstack/react-router'
import { PatchApplicationForm } from '@/features/patch/components/PatchApplicationForm'
import { derive } from '@/shared/domain/derive'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { useRecordedThenHome } from '@/shared/hooks/useRecordedThenHome'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { ThumbZone } from '@/shared/ui/ThumbZone'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/patch/new')({
  component: PatchApplicationPage,
})

function PatchApplicationPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const recorded = useRecordedThenHome(appSearch, 'patchRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const { protocol } = derive(journal, now)
        const cancel = (
          <Link
            to="/"
            search={appSearch}
            className={buttonVariants({ variant: 'ghost', size: 'lg' })}
          >
            {strings.patch.form.cancel}
          </Link>
        )
        return (
          <AppShell>
            {protocol === null ? (
              <ThumbZone>{cancel}</ThumbZone>
            ) : (
              <PatchApplicationForm
                journal={journal}
                position={protocol}
                now={now}
                onRecorded={recorded}
                secondary={cancel}
              />
            )}
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
