import { useCallback, useEffect, useState } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { JournalStore } from '@/shared/storage/journal-store'

export type JournalState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly journal: Journal }

/** Loads the store's journal once and persists every committed version before exposing it. */
export function useJournal(store: JournalStore): {
  state: JournalState
  commit: (journal: Journal) => Promise<void>
} {
  const [state, setState] = useState<JournalState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    store
      .load()
      .then((journal) => {
        if (!cancelled) setState({ status: 'ready', journal })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [store])

  const commit = useCallback(
    async (journal: Journal) => {
      try {
        await store.save(journal)
        setState({ status: 'ready', journal })
      } catch {
        setState({ status: 'error' })
      }
    },
    [store],
  )

  return { state, commit }
}
