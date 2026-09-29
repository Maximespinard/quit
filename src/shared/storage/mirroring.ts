import type { Journal } from '@/shared/domain/journal'
import { cleanDeviceKey, type MirrorLink } from '@/shared/domain/mirror-link'
import {
  acknowledgeChange,
  addPendingChanges,
  journalChanges,
  type PendingChange,
} from '@/shared/domain/pending-changes'
import type { JournalStore, Store } from './journal-store'
import { deliverChange } from './mirror-api'

/** The first retry waits this long, each next one twice as long, up to `MAX_RETRY_DELAY_MS`. */
const FIRST_RETRY_DELAY_MS = 2_000
const MAX_RETRY_DELAY_MS = 5 * 60_000

const growingDelay = (attempt: number) =>
  Math.min(FIRST_RETRY_DELAY_MS * 2 ** attempt, MAX_RETRY_DELAY_MS)

/**
 * One lock per pending store, shared by every mirroring over it: each read-then-write of the
 * pending changes runs alone, so a mirroring closing while an acknowledgement is on its way
 * never overwrites what a new one over the same device just added.
 */
const locks = new WeakMap<object, Promise<unknown>>()

function exclusivelyOn<T>(store: object, task: () => Promise<T>): Promise<T> {
  const run = (locks.get(store) ?? Promise.resolve()).then(task)
  locks.set(
    store,
    run.catch(() => {}),
  )
  return run
}

export type MirroringOptions = {
  /** The device's own journal: the reference, always written first. */
  readonly journal: JournalStore
  readonly pending: Store<readonly PendingChange[]>
  readonly link: Store<MirrorLink | null>
  /** Where the API lives: `''` for this origin. */
  readonly apiBase?: string
  readonly fetch?: typeof fetch
  /** How long to wait before the `attempt`th retry (from 0) after the server could not be reached. */
  readonly retryDelayMs?: (attempt: number) => number
  readonly now?: () => number
  /** Told every time the link changes: linked, or its key refused. */
  readonly onLinkChange?: (link: MirrorLink | null) => void
}

export type Mirroring = {
  /** The journal store the app writes through: the device's, each save adding pending changes for the mirror. */
  readonly journal: JournalStore
  /**
   * Sends the pending changes, one at a time, in order, until none is left, the server cannot
   * be reached (a retry is then scheduled, each one later) or the device key is refused.
   * Resolves once that run is over; a call during a run joins it.
   */
  readonly send: () => Promise<void>
  readonly loadLink: () => Promise<MirrorLink | null>
  /** Links this device to the mirror with a pasted device key, then sends what waits, unawaited. */
  readonly link: (pastedKey: string) => Promise<void>
  /** Stops the run in progress after its current request, and the retry scheduled, until `send`. */
  readonly stop: () => void
}

/**
 * Wraps the device's journal store (ADR-0003): every save persists the journal first, then
 * adds what changed since the previous version as pending changes — only while the device
 * is linked, a refused key included — and sends them. The app never waits for the network.
 */
export function createMirroring({
  journal,
  pending,
  link,
  apiBase = '',
  fetch: fetchFn = (input, init) => fetch(input, init),
  retryDelayMs = growingDelay,
  now = Date.now,
  onLinkChange,
}: MirroringOptions): Mirroring {
  /** The journal as last loaded or saved: what the next save is compared with. */
  let lastJournal: Journal | null = null
  const exclusively = <T>(task: () => Promise<T>) => exclusivelyOn(pending, task)

  let running: Promise<void> | null = null
  /** A send asked for while a run was on: the run goes round once more before it ends. */
  let sendRequested = false
  let stopped = false
  let attempt = 0
  let retry: ReturnType<typeof setTimeout> | undefined

  const retryLater = () => {
    if (stopped) return
    retry = setTimeout(() => void send(), retryDelayMs(attempt))
    attempt += 1
  }

  const saveLink = async (next: MirrorLink) => {
    await link.save(next)
    onLinkChange?.(next)
  }

  /** One run: sends until no change is pending, or stops on the first change that cannot leave. */
  async function drain(): Promise<void> {
    while (!stopped) {
      const linked = await link.load()
      if (linked === null || linked.revoked) return
      const [next] = await pending.load()
      if (next === undefined) return
      const delivery = await deliverChange(next.change, {
        apiBase,
        deviceKey: linked.deviceKey,
        fetch: fetchFn,
      })
      if (delivery === 'revoked') {
        // Unless a new key was pasted meanwhile: the refusal was the previous key's.
        if ((await link.load())?.deviceKey === linked.deviceKey) {
          await saveLink({ ...linked, revoked: true })
        }
        return
      }
      if (delivery === 'unreachable') return retryLater()
      // Acknowledged, or refused for good: a change the mirror can never take blocks no other.
      attempt = 0
      await exclusively(async () => pending.save(acknowledgeChange(await pending.load(), next.seq)))
    }
  }

  function send(): Promise<void> {
    // A send after `stop` resumes, even one joining the run `stop` cut short (React's strict
    // effects stop, then start again, one instance).
    stopped = false
    if (running !== null) {
      sendRequested = true
      return running
    }
    clearTimeout(retry)
    retry = undefined
    running = (async () => {
      do {
        sendRequested = false
        // The device's storage failing is no reason to give up: the next try may read it.
        await drain().catch(retryLater)
      } while (sendRequested && retry === undefined)
    })().finally(() => {
      running = null
    })
    return running
  }

  const load = async () => {
    const loaded = await journal.load()
    lastJournal = loaded
    return loaded
  }

  async function save(next: Journal) {
    await exclusively(async () => {
      const previous = lastJournal ?? (await journal.load())
      await journal.save(next)
      lastJournal = next
      if ((await link.load()) === null) return
      const changes = journalChanges(previous, next)
      if (changes.length === 0) return
      await pending.save(addPendingChanges(await pending.load(), changes, now()))
    })
    void send()
  }

  return {
    journal: { load, save },
    send,
    loadLink: () => link.load(),
    link: async (pastedKey) => {
      await saveLink({ deviceKey: cleanDeviceKey(pastedKey), revoked: false })
      attempt = 0
      void send()
    },
    stop: () => {
      stopped = true
      clearTimeout(retry)
    },
  }
}
