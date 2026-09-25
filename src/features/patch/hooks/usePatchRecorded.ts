import { useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'

/**
 * Commits the journal holding a patch application logged from its form, then returns home,
 * where it is confirmed. The entry is replaced: back never reopens a submitted form.
 */
export function usePatchRecorded(search: AppSearch): (journal: Journal) => void {
  const { commit } = useJournalSource()
  const navigate = useNavigate()

  return (journal) =>
    void commit(journal).then(() =>
      navigate({
        to: '/',
        search: validateAppSearch(search),
        state: { patchRecorded: true },
        replace: true,
      }),
    )
}
