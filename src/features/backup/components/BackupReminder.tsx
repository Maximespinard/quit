import { dismissReminder, isBackupDue } from '@/shared/domain/backup-reminder'
import type { Journal } from '@/shared/domain/journal'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import { Card } from '@/shared/ui/Card'
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
    <Card label={copy.label} className="gap-3.5">
      <p className="text-body">{message}</p>
      <div className="flex gap-2">
        <Button onClick={() => void exportFile(journal)}>{copy.export}</Button>
        <Button variant="ghost" onClick={() => void backup.save(dismissReminder(record, now))}>
          {copy.later}
        </Button>
      </div>
    </Card>
  )
}
