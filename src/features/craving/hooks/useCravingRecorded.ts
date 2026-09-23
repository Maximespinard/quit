import { useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'

/**
 * Commits the journal holding a new craving, then returns home, where the craving is
 * confirmed. The entry is replaced: back never reopens a finished timer or form.
 */
export function useCravingRecorded(search: AppSearch): (journal: Journal) => void {
  const { commit } = useJournalSource()
  const navigate = useNavigate()

  return (journal) =>
    void commit(journal).then(() =>
      navigate({
        to: '/',
        search: validateAppSearch(search),
        state: { cravingRecorded: true },
        replace: true,
      }),
    )
}
