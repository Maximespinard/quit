import type { StateFile } from './state-file.ts'
import type {
  Notification,
  PushSubscription,
  ScheduledNotification,
  SendOutcome,
  State,
  Transport,
} from './types.ts'
import { toPayload } from './validation.ts'

/**
 * An entry found due later than this (the service was down) is dropped rather than sent: a
 * reminder hours late is wrong, and a burst of stale ones on restart is worse.
 */
export const MAX_LATENESS_MS = 60 * 60_000

export type SendNowResult = SendOutcome['status'] | 'no-subscription'

export interface Sender {
  registerSubscription(subscription: PushSubscription): Promise<void>
  /** Only entries still in the future are kept: past ones were sent or are no longer wanted. */
  replaceSchedule(schedule: ScheduledNotification[]): Promise<void>
  sendNow(notification: Notification): Promise<SendNowResult>
  /** Sends every due entry once, in `sendAt` order. Never throws. */
  tick(): Promise<void>
}

interface SenderDeps {
  stateFile: StateFile
  transport: Transport
  now: () => number
  /** Operational messages only — never a notification's text, which may carry health figures. */
  log: (message: string) => void
}

export async function createSender({
  stateFile,
  transport,
  now,
  log,
}: SenderDeps): Promise<Sender> {
  let state = await stateFile.load()
  let ticking = false

  function update(next: State) {
    state = next
    return stateFile.save(next)
  }

  async function deliver(notification: Notification): Promise<SendNowResult> {
    const { subscription } = state
    if (!subscription) return 'no-subscription'
    let outcome: SendOutcome
    try {
      outcome = await transport.send(subscription, toPayload(notification))
    } catch (error) {
      outcome = { status: 'failed', reason: String(error) }
    }
    if (outcome.status === 'failed') log(`push failed: ${outcome.reason}`)
    // Unless a new subscription was registered while this push was in flight.
    if (outcome.status === 'gone' && state.subscription === subscription) {
      log('subscription gone: dropped')
      await update({ ...state, subscription: null })
    }
    return outcome.status
  }

  return {
    registerSubscription(subscription) {
      return update({ ...state, subscription })
    },

    replaceSchedule(schedule) {
      const time = now()
      return update({ ...state, schedule: schedule.filter((entry) => entry.sendAt > time) })
    },

    sendNow: deliver,

    async tick() {
      if (ticking) return
      ticking = true
      try {
        const time = now()
        const due = state.schedule.filter((entry) => entry.sendAt <= time)
        if (due.length === 0) return
        // Claimed before the first send: a restart or a schedule replaced mid-send can never
        // send them twice.
        await update({ ...state, schedule: state.schedule.filter((entry) => entry.sendAt > time) })
        for (const entry of due) {
          const sendAt = new Date(entry.sendAt).toISOString()
          if (time - entry.sendAt > MAX_LATENESS_MS) {
            log(`entry due at ${sendAt} dropped: overdue`)
          } else if ((await deliver(entry)) === 'no-subscription') {
            log(`entry due at ${sendAt} dropped: no subscription`)
          }
        }
      } catch (error) {
        log(`send loop failed: ${String(error)}`)
      } finally {
        ticking = false
      }
    },
  }
}
