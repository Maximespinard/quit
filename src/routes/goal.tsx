import { createFileRoute, Link, Navigate, useNavigate } from '@tanstack/react-router'
import { GoalForm } from '@/features/savings/components/GoalForm'
import { derive } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/goal')({
  component: GoalPage,
})

function GoalPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { state, commit, now } = useJournalSource()
  const navigate = useNavigate()
  const saved = (journal: Journal) =>
    void commit(journal).then(() => navigate({ to: '/', search: appSearch, replace: true }))

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const derived = derive(journal, now)
        // No goal before first launch: there is no money saved to measure it against.
        if (derived.quitMoment === null) return <Navigate to="/" search={appSearch} replace />
        const reached = derived.goal?.reached === true
        return (
          <AppShell>
            <GoalForm
              journal={journal}
              now={now}
              {...(journal.goal !== null && !reached ? { initial: journal.goal } : {})}
              replacesReached={reached}
              onSaved={saved}
            />
            <Link
              to="/"
              search={appSearch}
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              {strings.goal.form.cancel}
            </Link>
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
