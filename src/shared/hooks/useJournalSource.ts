import { createContext, useContext } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { Scenario, ScenarioId } from '@/shared/domain/scenarios'
import type { BackupSource } from './useBackupRecord'
import type { JournalState } from './useJournal'

/**
 * What the debug panel may do: move time, replace the sandbox journal with a scenario's and
 * wipe it — never grant a derived value (ADR-0002).
 */
export type SandboxControls = {
  /** The scenario loaded last, until the sandbox is wiped; the facts and the clock may have moved since. */
  readonly scenario: ScenarioId | null
  /** Replaces the sandbox journal and stops its clock on the scenario's. */
  readonly loadScenario: (scenario: Scenario) => Promise<void>
  readonly shiftClock: (byMs: number) => void
  readonly stopClockAt: (at: number) => void
  readonly resetClock: () => void
  readonly wipe: () => Promise<void>
}

/** The journal and the clock the whole app reads, chosen in one place: `JournalSourceProvider`. */
export type JournalSource = {
  readonly state: JournalState
  readonly commit: (journal: Journal) => Promise<void>
  /** The one `now` everything derives from: real time, or the sandbox clock. */
  readonly now: number
  /** When this source's journal was last exported: the sandbox keeps its own, in memory. */
  readonly backup: BackupSource
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
