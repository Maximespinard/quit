import { useCallback, useEffect, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import { loadJournal, saveJournal } from '@/shared/storage/journal-store'

export type JournalState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly journal: Journal }

/** Loads the device journal once and persists every committed version before exposing it. */
export function useJournal(): {
  state: JournalState
  commit: (journal: Journal) => Promise<void>
} {
  const [state, setState] = useState<JournalState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadJournal()
      .then((journal) => {
        if (!cancelled) setState({ status: 'ready', journal })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const commit = useCallback(async (journal: Journal) => {
    try {
      await saveJournal(journal)
      setState({ status: 'ready', journal })
    } catch {
      setState({ status: 'error' })
    }
  }, [])

  return { state, commit }
}
