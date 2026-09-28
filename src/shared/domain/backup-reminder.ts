import { DAY_MS } from '@/shared/utils/duration'

/**
 * When this device last saved the journal to a file, and when the export reminder was last
 * dismissed. Kept beside the journal, never in it: it is about the device, not the journey,
 * and is neither exported nor imported.
 */
export type BackupRecord = {
  /** The latest export, or import: the journal then matches a file the user holds. */
  readonly lastBackupAt: number | null
  readonly reminderDismissedAt: number | null
}

export const noBackup: BackupRecord = { lastBackupAt: null, reminderDismissedAt: null }

/** No reminder in the first days: nothing much to lose yet. */
const FIRST_REMINDER_AFTER = 3 * DAY_MS
/** iOS may evict a rarely opened PWA's storage (ADR-0001): a backup older than this is stale. */
const STALE_AFTER = 14 * DAY_MS
/** A dismissed reminder comes back after this long. */
const DISMISSED_FOR = 3 * DAY_MS

/** A backup made at `now`; any earlier dismissal no longer matters. */
export const backedUpAt = (now: number): BackupRecord => ({
  lastBackupAt: now,
  reminderDismissedAt: null,
})

export const dismissReminder = (record: BackupRecord, now: number): BackupRecord => ({
  ...record,
  reminderDismissedAt: now,
})

/**
 * Whether home nudges the user to export: no export yet a few days after the quit moment, or
 * the last one too old — unless the nudge was dismissed recently.
 */
export function isBackupDue(record: BackupRecord, quitMoment: number, now: number): boolean {
  const { lastBackupAt, reminderDismissedAt } = record
  if (reminderDismissedAt !== null && now - reminderDismissedAt < DISMISSED_FOR) return false
  return lastBackupAt === null
    ? now - quitMoment >= FIRST_REMINDER_AFTER
    : now - lastBackupAt >= STALE_AFTER
}

const instantOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

/** Rebuilds a stored record; anything unreadable counts as never backed up. */
export function decodeBackupRecord(raw: unknown): BackupRecord {
  if (typeof raw !== 'object' || raw === null) return noBackup
  const { lastBackupAt, reminderDismissedAt } = raw as Record<string, unknown>
  return {
    lastBackupAt: instantOrNull(lastBackupAt),
    reminderDismissedAt: instantOrNull(reminderDismissedAt),
  }
}
