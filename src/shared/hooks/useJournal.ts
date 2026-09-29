import { useCallback, useEffect, useState } from 'react'
import { type Journal, withFactIds } from '@/shared/domain/journal'
import type { JournalStore } from '@/shared/storage/journal-store'
import { newFactId } from '@/shared/utils/fact-id'

export type JournalState =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly journal: Journal }

/**
 * Loads the store's journal once and persists every committed version before exposing it.
 * Every fact it exposes or stores has its id: a newly recorded one gets it here, on its way
 * to the store, whichever path recorded it (ADR-0003).
 */
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
        if (!cancelled) setState({ status: 'ready', journal: withFactIds(journal, newFactId) })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [store])

  const commit = useCallback(
    async (recorded: Journal) => {
      const journal = withFactIds(recorded, newFactId)
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
