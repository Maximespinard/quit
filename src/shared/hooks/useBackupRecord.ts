import { useCallback, useEffect, useState } from 'react'
import type { BackupRecord } from '@/shared/domain/backup-reminder'
import type { BackupStore } from '@/shared/storage/journal-store'

/** The source's backup record and a way to replace it. */
export type BackupSource = {
  /** `null` while loading, or when unreadable: no reminder is shown then. */
  readonly record: BackupRecord | null
  readonly save: (record: BackupRecord) => Promise<void>
}

/** Loads the store's backup record once; a failed save keeps the record shown, it only nags. */
export function useBackupRecord(store: BackupStore): BackupSource {
  const [record, setRecord] = useState<BackupRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    store
      .load()
      .then((loaded) => {
        if (!cancelled) setRecord(loaded)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [store])

  const save = useCallback(
    async (next: BackupRecord) => {
      setRecord(next)
      await store.save(next).catch(() => {})
    },
    [store],
  )

  return { record, save }
}
