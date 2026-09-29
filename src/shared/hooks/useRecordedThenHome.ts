import { type HistoryState, useNavigate } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { type AppSearch, validateAppSearch } from '@/shared/utils/app-search'
import { strings } from '@/shared/utils/strings'

/** The history flags a screen sets to have home confirm what it just recorded or imported. */
const recordedNotices = [
  'cravingRecorded',
  'patchRecorded',
  'lapseRecorded',
  'journalImported',
] as const

export type RecordedNotice = (typeof recordedNotices)[number]

const noticeCopy: Record<RecordedNotice, string> = {
  cravingRecorded: strings.craving.recorded,
  patchRecorded: strings.patch.recorded,
  lapseRecorded: strings.lapse.recorded,
  journalImported: strings.backup.imported,
}

/** Home's confirmation for the flag set by the navigation that brought it, or `null`. */
export function recordedNotice(state: HistoryState): string | null {
  const notice = recordedNotices.find((flag) => state[flag] === true)
  return notice === undefined ? null : noticeCopy[notice]
}

/**
 * Commits the journal holding a newly recorded fact (or an imported journal), then returns home, where `notice`
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
