import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PastCravingForm } from '@/features/craving/components/PastCravingForm'
import { DeleteFact } from '@/features/history/components/DeleteFact'
import { LapseForm } from '@/features/lapse/components/LapseForm'
import { PatchApplicationForm } from '@/features/patch/components/PatchApplicationForm'
import { derive } from '@/shared/domain/derive'
import { type Journal, removeFact } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { AppShell } from '@/shared/ui/app-shell'
import { buttonVariants } from '@/shared/ui/base/button'
import { ReadyJournal } from '@/shared/ui/ReadyJournal'
import { validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

export const Route = createFileRoute('/history/$position')({
  component: EditFactPage,
})

const copy = strings.history

/**
 * One fact of the history, to edit or delete. Its form is the one that recorded it, given the
 * journal without it: saving records the new version under the same rules as at creation.
 */
function EditFactPage() {
  const appSearch = validateAppSearch(Route.useSearch())
  const { position: param } = Route.useParams()
  const { state, commit, now } = useJournalSource()
  const navigate = useNavigate()

  // Back to the history, replacing this entry: back never reopens a fact already changed.
  const commitThenHistory = (journal: Journal, notice: 'factEdited' | 'factDeleted') =>
    void commit(journal).then(() =>
      navigate({ to: '/history', search: appSearch, state: { [notice]: true }, replace: true }),
    )

  return (
    <ReadyJournal state={state}>
      {(journal) => {
        const position = Number(param)
        const fact = journal.facts[position]
        const rest = removeFact(journal, position)
        const saved = (edited: Journal) => commitThenHistory(edited, 'factEdited')
        const { protocol } = derive(journal, now)
        const form =
          fact?.type === 'lapse' ? (
            <LapseForm journal={rest} now={now} initial={fact} onRecorded={saved} />
          ) : fact?.type === 'craving' ? (
            <PastCravingForm journal={rest} now={now} initial={fact} onRecorded={saved} />
          ) : fact?.type === 'patch-application' && protocol !== null ? (
            <PatchApplicationForm
              journal={rest}
              position={protocol}
              now={now}
              initial={fact}
              onRecorded={saved}
            />
          ) : null
        return (
          <AppShell>
            {form === null || fact === undefined ? (
              <p className="pt-6 text-body text-ink-soft">{copy.missing}</p>
            ) : (
              <>
                {form}
                <DeleteFact
                  confirm={fact.type === 'lapse'}
                  onDelete={() => commitThenHistory(rest, 'factDeleted')}
                />
              </>
            )}
            <Link
              to="/history"
              search={appSearch}
              className={buttonVariants({ variant: 'ghost', size: 'lg' })}
            >
              {copy.back}
            </Link>
          </AppShell>
        )
      }}
    </ReadyJournal>
  )
}
