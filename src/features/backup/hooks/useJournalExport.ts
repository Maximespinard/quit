import { useState } from 'react'
import { backedUpAt } from '@/shared/domain/backup-reminder'
import type { Journal } from '@/shared/domain/journal'
import { exportJournal } from '@/shared/domain/journal-file'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { strings } from '@/shared/utils/strings'
import { fileDay, saveJsonFile } from '../utils/save-file'

export type ExportStatus = 'idle' | 'exported' | 'failed'

/**
 * Exports the active source's journal — the sandbox's own while it is on — and records the
 * backup once the file is handed over. A cancelled share sheet is no backup and no error.
 */
export function useJournalExport(): {
  status: ExportStatus
  exportFile: (journal: Journal) => Promise<void>
} {
  const { now, backup, sandbox } = useJournalSource()
  const [status, setStatus] = useState<ExportStatus>('idle')

  const run = async (journal: Journal) => {
    const inSandbox = sandbox !== null
    const outcome = await saveJsonFile(
      exportJournal(journal, now, inSandbox ? 'sandbox' : 'device'),
      strings.backup.fileName(fileDay(now), inSandbox),
    )
    if (outcome === 'saved') await backup.save(backedUpAt(now))
    setStatus(outcome === 'cancelled' ? 'idle' : outcome === 'saved' ? 'exported' : 'failed')
  }

  return { status, exportFile: run }
}
