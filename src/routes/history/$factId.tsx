import { createFileRoute } from '@tanstack/react-router'
import { PastCravingForm } from '@/features/craving/components/PastCravingForm'
import { EditFact } from '@/features/history/components/EditFact'
import type { FactForms } from '@/features/history/types/edit-fact'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { PatchApplicationForm } from '@/features/patch/components/PatchApplicationForm'
import { useCommitThen } from '@/shared/hooks/useCommitThen'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/AppShell'
import { CancelLink } from '@/shared/ui/CancelLink'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/history/$factId')({
  component: EditFactPage,
})

/** Each fact type's form, from the feature that records it: only a route may join them. */
const forms: FactForms = {
  lapse: (fact, { rest, now, onSaved, secondary }) => (
    <LapseForm journal={rest} now={now} initial={fact} onRecorded={onSaved} secondary={secondary} />
  ),
  craving: (fact, { rest, now, onSaved, secondary }) => (
    <PastCravingForm
      journal={rest}
      now={now}
      initial={fact}
      onRecorded={onSaved}
      secondary={secondary}
    />
  ),
  'patch-application': (fact, { rest, now, position, onSaved, secondary }) => (
    <PatchApplicationForm
      journal={rest}
      position={position}
      now={now}
      initial={fact}
      onRecorded={onSaved}
      secondary={secondary}
    />
  ),
}

function EditFactPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { factId } = Route.useParams()
  const { state, now } = useJournalSource()
  // Back to the history, where the notice confirms what changed.
  const thenHistory = useCommitThen('/history', appSearch)

  return (
    <ReadyJournal state={state}>
      {(journal) => (
        <AppShell>
          <EditFact
            journal={journal}
            factId={factId}
            now={now}
            forms={forms}
            onEdited={(edited) => thenHistory(edited, { factEdited: true })}
            onDeleted={(rest) => thenHistory(rest, { factDeleted: true })}
            back={
              <CancelLink to="/history" search={appSearch}>
                {strings.history.back}
              </CancelLink>
            }
          />
        </AppShell>
      )}
    </ReadyJournal>
  )
}
