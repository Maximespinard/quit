import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { PastCravingForm } from '@/features/craving/components/PastCravingForm'
import { DeleteFact } from '@/features/history/components/DeleteFact'
import { type HistoryFact, historyFact } from '@/features/history/utils/history-days'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { PatchApplicationForm } from '@/features/patch/components/PatchApplicationForm'
import { derive } from '@/shared/domain/derive'
import { type Journal, removeFact } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { ThumbZone } from '@/shared/ui/ThumbZone'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/history/$factId')({
  component: EditFactPage,
})

const copy = strings.history

/**
 * What the form of a fact needs: the journal without it, the clock, where the edit goes, and
 * what sits under its primary action.
 */
type EditContext = {
  readonly rest: Journal
  readonly journal: Journal
  readonly now: number
  readonly onSaved: (journal: Journal) => void
  readonly secondary: ReactNode
}

/**
 * The form that recorded a fact, prefilled with it. One case per type: a fact type added to
 * the journal fails to compile here until it can be edited.
 */
function editForm(
  fact: HistoryFact,
  { rest, journal, now, onSaved, secondary }: EditContext,
): ReactNode {
  switch (fact.type) {
    case 'lapse':
      return (
        <LapseForm
          journal={rest}
          now={now}
          initial={fact}
          onRecorded={onSaved}
          secondary={secondary}
        />
      )
    case 'craving':
      return (
        <PastCravingForm
          journal={rest}
          now={now}
          initial={fact}
          onRecorded={onSaved}
          secondary={secondary}
        />
      )
    case 'patch-application': {
      const { protocol } = derive(journal, now)
      return protocol === null ? (
        <ThumbZone>{secondary}</ThumbZone>
      ) : (
        <PatchApplicationForm
          journal={rest}
          position={protocol}
          now={now}
          initial={fact}
          onRecorded={onSaved}
          secondary={secondary}
        />
      )
    }
    default: {
      const unhandled: never = fact
      return unhandled
    }
  }
}

/**
 * One fact of the history, opened by its id, to edit or delete. Its form is the one that
 * recorded it, given the journal without it: saving records the new version, under the same
 * id, by the same rules as at creation.
 */
function EditFactPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { factId } = Route.useParams()
  const { state, commit, now } = useJournalSource()
  const navigate = useNavigate()

  // Back to the history, replacing this page: back never reopens a fact already changed.
  const commitThenHistory = (journal: Journal, notice: 'factEdited' | 'factDeleted') =>
    void commit(journal).then(() =>
      navigate({ to: '/history', search: appSearch, state: { [notice]: true }, replace: true }),
    )

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const fact = historyFact(journal, factId)
        const rest = removeFact(journal, factId)
        const back = (
          <Link
            to="/history"
            search={appSearch}
            className={buttonVariants({ variant: 'ghost', size: 'lg' })}
          >
            {copy.back}
          </Link>
        )
        return (
          <AppShell>
            {fact === null ? (
              <>
                <p className="pt-6 text-body text-muted">{copy.missing}</p>
                <ThumbZone>{back}</ThumbZone>
              </>
            ) : (
              editForm(fact, {
                rest,
                journal,
                now,
                onSaved: (edited) => commitThenHistory(edited, 'factEdited'),
                secondary: (
                  <>
                    {/* Set apart under a rule: saving and deleting never sit one mis-tap apart. */}
                    <div className="mt-4 flex flex-col border-line border-t pt-6">
                      <DeleteFact
                        fact={fact}
                        onDelete={() => commitThenHistory(rest, 'factDeleted')}
                      />
                    </div>
                    {back}
                  </>
                ),
              })
            )}
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
