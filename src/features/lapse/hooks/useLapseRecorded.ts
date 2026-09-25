import { useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'

/**
 * Commits the journal holding a new lapse, then returns home, where it is acknowledged.
 * The entry is replaced: back never reopens the form that recorded it.
 */
export function useLapseRecorded(search: AppSearch): (journal: Journal) => void {
  const { commit } = useJournalSource()
  const navigate = useNavigate()

  return (journal) =>
    void commit(journal).then(() =>
      navigate({
        to: '/',
        search: validateAppSearch(search),
        state: { lapseRecorded: true },
        replace: true,
      }),
    )
}
