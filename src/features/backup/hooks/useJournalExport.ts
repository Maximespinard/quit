import { useState } from 'react'
import { backedUpAt } from '@/shared/domain/backup-reminder'
import type { Journal } from '@/shared/domain/journal'
import { exportJournal } from '@/shared/domain/journal-file'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { journalFileName, saveJsonFile } from '../utils/save-file'

export type ExportStatus = 'idle' | 'exported' | 'failed'

/**
 * Exports the active source's journal — the sandbox's own while it is on — and records the
 * backup once the file is handed over. A cancelled share sheet is no backup and no error.
 */
export function useJournalExport(): {
  status: ExportStatus
  exportJournal: (journal: Journal) => Promise<void>
} {
  const { now, backup, sandbox } = useJournalSource()
  const [status, setStatus] = useState<ExportStatus>('idle')

  const run = async (journal: Journal) => {
    const outcome = await saveJsonFile(
      exportJournal(journal, now),
      journalFileName(now, sandbox !== null),
    )
    if (outcome === 'saved') await backup.save(backedUpAt(now))
    setStatus(outcome === 'cancelled' ? 'idle' : outcome === 'saved' ? 'exported' : 'failed')
  }

  return { status, exportJournal: run }
}
