import { type HistoryState, useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'

/**
 * Commits a journal, then goes to `to`, where `state` may have it confirm what changed. The
 * entry is replaced: back never reopens a finished timer or form, nor a fact already changed.
 */
export function useCommitThen(
  to: '/' | '/history',
  search: AppSearch,
): (journal: Journal, state?: HistoryState) => void {
  const { commit } = useJournalSource()
  const navigate = useNavigate()

  return (journal, state = {}) =>
    void commit(journal).then(() =>
      navigate({ to, search: validateAppSearch(search), state, replace: true }),
    )
}
