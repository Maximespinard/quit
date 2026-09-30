import { createFileRoute, Navigate } from '@tanstack/react-router'
import { GoalForm } from '@/features/savings/components/GoalForm'
import { derive } from '@/shared/domain/derive'
import { useCommitThenHome } from '@/shared/hooks/useCommitThenHome'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { CancelLink } from '@/shared/ui/CancelLink'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/goal')({
  component: GoalPage,
})

function GoalPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, now } = useJournalSource()
  const saved = useCommitThenHome(appSearch)

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const derived = derive(journal, now)
        // No money saved yet (no quit moment, or its settings unset): nothing to measure a goal against.
        if (derived.moneySavedCents === null) return <Navigate to="/" search={appSearch} replace />
        return (
          <AppShell>
            <GoalForm
              journal={journal}
              now={now}
              goal={derived.goal}
              onSaved={saved}
              secondary={
                <CancelLink to="/" search={appSearch}>
                  {strings.goal.form.cancel}
                </CancelLink>
              }
            />
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
