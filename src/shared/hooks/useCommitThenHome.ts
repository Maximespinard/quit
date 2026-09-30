import type { HistoryState } from '@tanstack/react-router'
import type { Journal } from '@/shared/domain/journal'
import { useCommitThen } from '@/shared/hooks/useCommitThen'
import type { AppSearch } from '@/shared/utils/app-search'
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
 * Commits a changed journal, then returns home. With a `notice`, home confirms the fact just
 * recorded or the journal just imported; without, home is the acknowledgement: it already
 * shows what the change does.
 */
export function useCommitThenHome(
  search: AppSearch,
  notice?: RecordedNotice,
): (journal: Journal) => void {
  const commitThen = useCommitThen('/', search)
  return (journal) => commitThen(journal, notice === undefined ? {} : { [notice]: true })
}
