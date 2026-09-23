import { type ReactNode, useState } from 'react'
import { emptyJournal } from '@/shared/domain/journal'
import { useJournal } from '@/shared/hooks/useJournal'
import { JournalSourceContext } from '@/shared/hooks/useJournalSource'
import { useNow } from '@/shared/hooks/useNow'
import { deviceJournalStore } from '@/shared/storage/journal-store'
import { createMemoryJournalStore } from '@/shared/storage/memory-journal-store'
import {
  readSandboxClock,
  realTimeClock,
  type SandboxClock,
  shiftSandboxClock,
  stoppedClock,
} from '@/shared/utils/sandbox-clock'

type JournalSourceProviderProps = {
  /** On: an in-memory journal and a movable clock. The device journal is never read or written. */
  sandbox: boolean
  /** Starts the sandbox clock stopped on this instant (ms since epoch); `null` follows real time. */
  clockAt: number | null
  children: ReactNode
}

/** The journal source switch: which journal and which clock the whole app uses. */
export function JournalSourceProvider({ sandbox, clockAt, children }: JournalSourceProviderProps) {
  if (!sandbox) return <DeviceSource>{children}</DeviceSource>
  return (
    <SandboxSource key={clockAt ?? 'real-time'} clockAt={clockAt}>
      {children}
    </SandboxSource>
  )
}

function DeviceSource({ children }: { children: ReactNode }) {
  const now = useNow()
  const { state, commit } = useJournal(deviceJournalStore)

  return (
    <JournalSourceContext.Provider value={{ state, commit, now, sandbox: null }}>
      {children}
    </JournalSourceContext.Provider>
  )
}

function SandboxSource({ clockAt, children }: { clockAt: number | null; children: ReactNode }) {
  const realNow = useNow()
  const [store] = useState(createMemoryJournalStore)
  const { state, commit } = useJournal(store)
  const [clock, setClock] = useState<SandboxClock>(() =>
    clockAt === null ? realTimeClock : stoppedClock(clockAt),
  )

  const sandbox = {
    shiftClock: (byMs: number) => setClock((current) => shiftSandboxClock(current, byMs)),
    resetClock: () => setClock(realTimeClock),
    wipe: () => commit(emptyJournal),
  }

  return (
    <JournalSourceContext.Provider
      value={{ state, commit, now: readSandboxClock(clock, realNow), sandbox }}
    >
      {children}
    </JournalSourceContext.Provider>
  )
}
