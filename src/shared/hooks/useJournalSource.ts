import { createContext, useContext } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { JournalState } from './useJournal'

/** What the debug panel may do: move time and wipe facts — never grant a derived value (ADR-0002). */
export type SandboxControls = {
  readonly shiftClock: (byMs: number) => void
  readonly resetClock: () => void
  readonly wipe: () => Promise<void>
}

/** The journal and the clock the whole app reads, chosen in one place: `JournalSourceProvider`. */
export type JournalSource = {
  readonly state: JournalState
  readonly commit: (journal: Journal) => Promise<void>
  /** The one `now` everything derives from: real time, or the sandbox clock. */
  readonly now: number
  /** Present only while the sandbox is active. */
  readonly sandbox: SandboxControls | null
}

export const JournalSourceContext = createContext<JournalSource | null>(null)

export function useJournalSource(): JournalSource {
  const source = useContext(JournalSourceContext)
  if (source === null)
    throw new Error('useJournalSource must be used within a JournalSourceProvider.')
  return source
}
