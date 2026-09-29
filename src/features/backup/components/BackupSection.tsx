import { useId } from 'react'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { formatDate } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { useJournalExport } from '../hooks/useJournalExport'
import { ImportJournal } from './ImportJournal'

type BackupSectionProps = {
  journal: Journal
  onImported: (journal: Journal) => void
}

const copy = strings.backup

/**
 * Settings' export and import. Both act on the active journal source, and the section says
 * which: in the sandbox, its own journal, never the real one.
 */
export function BackupSection({ journal, onImported }: BackupSectionProps) {
  const titleId = useId()
  const { backup, sandbox } = useJournalSource()
  const { status, exportFile } = useJournalExport()
  const inSandbox = sandbox !== null

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3 rounded-card bg-surface p-4">
      <div className="flex flex-col gap-1">
        <h3 id={titleId} className="font-medium text-body">
          {copy.title}
        </h3>
        <p className="text-body text-muted">{inSandbox ? copy.sandboxLead : copy.lead}</p>
      </div>
      {/* Nothing while the record loads, or when it cannot be read: never a false "no backup". */}
      {backup.record === null ? null : (
        <p className="text-muted text-label">
          {backup.record.lastBackupAt === null
            ? copy.never
            : copy.last(formatDate(backup.record.lastBackupAt))}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={() => void exportFile(journal)}>
          {inSandbox ? copy.exportSandbox : copy.export}
        </Button>
        <p role="status" className="text-muted text-label empty:hidden">
          {status === 'exported' ? copy.exported : null}
        </p>
        {status === 'failed' ? (
          <p role="alert" className="text-alert text-label">
            {copy.exportFailed}
          </p>
        ) : null}
      </div>
      <ImportJournal
        journal={journal}
        label={inSandbox ? copy.importSandbox : copy.import}
        onImported={onImported}
      />
    </section>
  )
}
