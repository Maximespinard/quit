import { type ReactNode, useState } from 'react'
import { noBackup } from '@/shared/domain/backup-reminder'
import { emptyJournal } from '@/shared/domain/journal'
import { type Scenario, type ScenarioId, scenarioById } from '@/shared/domain/scenarios'
import { useBackupRecord } from '@/shared/hooks/useBackupRecord'
import { useJournal } from '@/shared/hooks/useJournal'
import { JournalSourceContext, type SandboxControls } from '@/shared/hooks/useJournalSource'
import { useNow } from '@/shared/hooks/useNow'
import { deviceBackupStore, deviceJournalStore } from '@/shared/storage/journal-store'
import { createMemoryJournalStore, createMemoryStore } from '@/shared/storage/memory-journal-store'
import type { JournalSourceChoice } from '@/shared/utils/app-search'
import {
  readSandboxClock,
  realTimeClock,
  type SandboxClock,
  shiftSandboxClock,
  stoppedClock,
} from '@/shared/utils/sandbox-clock'

type JournalSourceProviderProps = {
  /** Sandbox: an in-memory journal and a movable clock. The device journal is never read or written. */
  source: JournalSourceChoice
  children: ReactNode
}

/** Provides the journal and the clock the url chose (`journalSourceFrom`) to the whole app. */
export function JournalSourceProvider({ source, children }: JournalSourceProviderProps) {
  if (source.kind === 'real') return <DeviceSource>{children}</DeviceSource>
  // A new clock instant or scenario in the url starts a new sandbox: its journal starts over.
  return (
    <SandboxSource
      key={`${source.clockAt ?? 'real-time'}/${source.scenario ?? 'empty'}`}
      clockAt={source.clockAt}
      scenario={source.scenario === null ? null : scenarioById(source.scenario)}
    >
      {children}
    </SandboxSource>
  )
}

function DeviceSource({ children }: { children: ReactNode }) {
  const now = useNow()
  const { state, commit } = useJournal(deviceJournalStore)
  const backup = useBackupRecord(deviceBackupStore)

  return (
    <JournalSourceContext.Provider value={{ state, commit, now, backup, sandbox: null }}>
      {children}
    </JournalSourceContext.Provider>
  )
}

type SandboxSourceProps = {
  clockAt: number | null
  scenario: Scenario | null
  children: ReactNode
}

/** The clock the sandbox starts on: the url's instant, else the scenario's, else real time. */
function startingClock(clockAt: number | null, scenario: Scenario | null): SandboxClock {
  if (clockAt !== null) return stoppedClock(clockAt)
  return scenario === null ? realTimeClock : stoppedClock(scenario.now)
}

function SandboxSource({ clockAt, scenario: initial, children }: SandboxSourceProps) {
  const realNow = useNow()
  const [store] = useState(() => createMemoryJournalStore(initial?.journal))
  const { state, commit } = useJournal(store)
  const [backupStore] = useState(() => createMemoryStore(noBackup))
  const backup = useBackupRecord(backupStore)
  const [clock, setClock] = useState(() => startingClock(clockAt, initial))
  const [scenario, setScenario] = useState<ScenarioId | null>(initial?.id ?? null)

  const sandbox: SandboxControls = {
    scenario,
    loadScenario: async (next) => {
      await commit(next.journal)
      setClock(stoppedClock(next.now))
      setScenario(next.id)
    },
    shiftClock: (byMs) => setClock((current) => shiftSandboxClock(current, byMs)),
    stopClockAt: (at) => setClock(stoppedClock(at)),
    resetClock: () => setClock(realTimeClock),
    wipe: async () => {
      await commit(emptyJournal)
      setScenario(null)
    },
  }

  return (
    <JournalSourceContext.Provider
      value={{ state, commit, now: readSandboxClock(clock, realNow), backup, sandbox }}
    >
      {children}
    </JournalSourceContext.Provider>
  )
}
