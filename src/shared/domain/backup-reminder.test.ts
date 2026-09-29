import {
  type BackupRecord,
  backedUpAt,
  decodeBackupRecord,
  dismissReminder,
  isBackupDue,
  noBackup,
} from './backup-reminder'

const HOUR = 60 * 60_000
const DAY = 24 * HOUR
const QUIT = Date.UTC(2026, 8, 1, 9, 0, 0)

describe('isBackupDue', () => {
  it('stays quiet during the first days without any export', () => {
    expect(isBackupDue(noBackup, QUIT, QUIT + 3 * DAY - HOUR)).toBe(false)
  })

  it('asks for a first export after three days', () => {
    expect(isBackupDue(noBackup, QUIT, QUIT + 3 * DAY)).toBe(true)
  })

  it('stays quiet while the last export is under two weeks old', () => {
    const record = backedUpAt(QUIT + 5 * DAY)

    expect(isBackupDue(record, QUIT, QUIT + 19 * DAY - HOUR)).toBe(false)
  })

  it('asks again once the last export is two weeks old', () => {
    const record = backedUpAt(QUIT + 5 * DAY)

    expect(isBackupDue(record, QUIT, QUIT + 19 * DAY)).toBe(true)
  })

  it('stays quiet for three days once dismissed, then comes back', () => {
    const dismissed = dismissReminder(noBackup, QUIT + 4 * DAY)

    expect(isBackupDue(dismissed, QUIT, QUIT + 7 * DAY - HOUR)).toBe(false)
    expect(isBackupDue(dismissed, QUIT, QUIT + 7 * DAY)).toBe(true)
  })

  it('forgets a dismissal once an export is made', () => {
    const record = backedUpAt(QUIT + 30 * DAY)

    expect(record).toEqual({ lastBackupAt: QUIT + 30 * DAY, reminderDismissedAt: null })
    expect(isBackupDue(record, QUIT, QUIT + 44 * DAY)).toBe(true)
  })

  it('stays quiet on a clock moved before the last export', () => {
    expect(isBackupDue(backedUpAt(QUIT + 20 * DAY), QUIT, QUIT + 4 * DAY)).toBe(false)
  })
})

describe('decodeBackupRecord', () => {
  it('reads a stored record back', () => {
    const stored: BackupRecord = { lastBackupAt: QUIT, reminderDismissedAt: QUIT + DAY }

    expect(decodeBackupRecord(stored)).toEqual(stored)
  })

  it.each([undefined, null, 'x', { lastBackupAt: 'yesterday', reminderDismissedAt: Number.NaN }])(
    'reads %s as no export yet',
    (raw) => {
      expect(decodeBackupRecord(raw)).toEqual(noBackup)
    },
  )
})
