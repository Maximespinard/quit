import { type HistoryState, useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'

/** The history flags a screen sets to have home confirm what it just recorded. */
export type RecordedNotice =
  | 'cravingRecorded'
  | 'patchRecorded'
  | 'lapseRecorded'
  | 'journalImported'

/**
 * Commits the journal holding a newly recorded fact, then returns home, where `notice`
 * confirms it. The entry is replaced: back never reopens a finished timer or form.
 */
export function useRecordedThenHome(
  search: AppSearch,
  notice: RecordedNotice,
): (journal: Journal) => void {
  const { commit } = useJournalSource()
  const navigate = useNavigate()
  const state: HistoryState = { [notice]: true }

  return (journal) =>
    void commit(journal).then(() =>
      navigate({ to: '/', search: validateAppSearch(search), state, replace: true }),
    )
}
