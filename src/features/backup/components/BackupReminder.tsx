import { dismissReminder, isBackupDue } from '@/shared/domain/backup-reminder'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { DAY_MS } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'
import { useJournalExport } from '../hooks/useJournalExport'

type BackupReminderProps = {
  journal: Journal
  quitMoment: number
}

const copy = strings.backup.reminder

/**
 * Home's nudge to export: iOS may evict a rarely opened PWA's storage (ADR-0001). A banner,
 * never a push; « Plus tard » hides it for a few days, an export until the backup grows old.
 */
export function BackupReminder({ journal, quitMoment }: BackupReminderProps) {
  const { now, backup } = useJournalSource()
  const { exportFile } = useJournalExport()
  const { record } = backup
  if (record === null || !isBackupDue(record, quitMoment, now)) return null

  const message =
    record.lastBackupAt === null
      ? copy.first
      : copy.stale(Math.floor((now - record.lastBackupAt) / DAY_MS))

  return (
    <section aria-label={copy.label} className="flex flex-col gap-3 rounded-card bg-surface p-4">
      <p className="text-body">{message}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void exportFile(journal)}>
          {copy.export}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          // On `surface`, the ghost's default press colour would not show.
          className="active:bg-ghost"
          onClick={() => void backup.save(dismissReminder(record, now))}
        >
          {copy.later}
        </Button>
      </div>
    </section>
  )
}
