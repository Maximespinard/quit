import { createFileRoute } from '@tanstack/react-router'
import { PatchApplicationForm } from '@/features/patch/components/PatchApplicationForm'
import { derive } from '@/shared/domain/derive'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/AppShell'
import { CancelLink } from '@/shared/ui/CancelLink'
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
  const recorded = useCommitThenHome(appSearch, 'patchRecorded')

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const { protocol } = derive(journal, now)
        const cancel = (
          <CancelLink to="/" search={appSearch}>
            {strings.patch.form.cancel}
          </CancelLink>
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
