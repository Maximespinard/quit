import {
  type PushNotification,
  type PushSubscription,
  type ScheduledPushNotification,
  toPushPayload,
} from '@quit/contract/push'
import { and, asc, eq, lte } from 'drizzle-orm'
import type { Db } from './database.ts'
import type { Logger } from './logger.ts'
import { pushSubscription, scheduledNotifications } from './schema.ts'

/**
 * The dumb push sender of ADR-0001: it stores one subscription and one schedule of ready-made
 * notifications, and sends each entry when due. It knows nothing about the domain.
 */

/**
 * An entry found due later than this (the server was down) is dropped rather than sent: a
 * reminder hours late is wrong, and a burst of stale ones on restart is worse.
 */
const MAX_LATENESS_MS = 60 * 60_000

/** The subscription row's fixed id: there is only ever one. */
const SUBSCRIPTION_ROW = 1

export type SendOutcome =
  | { status: 'sent' }
  /** The push service no longer knows the subscription (404/410): it will never work again. */
  | { status: 'gone' }
  | { status: 'failed'; reason: string }

/** Delivers one payload to one subscription: web push in production, a fake in tests. */
export interface Transport {
  send(subscription: PushSubscription, payload: string): Promise<SendOutcome>
}

export type SendNowResult = SendOutcome['status'] | 'no-subscription'

export interface PushSender {
  registerSubscription(subscription: PushSubscription): void
  /** Replaces the whole schedule, keeping only entries still in the future. */
  replaceSchedule(notifications: readonly ScheduledPushNotification[]): void
  sendNow(notification: PushNotification): Promise<SendNowResult>
  /**
   * Sends every due entry once, in `sendAt` order. Never throws; while a run is in flight,
   * returns that run.
   */
  tick(): Promise<void>
}

export function createPushSender({
  db,
  transport,
  now,
  logger,
}: {
  db: Db
  transport: Transport
  now: () => Date
  /** Operational messages only — never a notification's text, which may carry health figures. */
  logger: Logger
}): PushSender {
  let inFlight: Promise<void> | undefined

  function currentSubscription(): PushSubscription | undefined {
    const row = db.select().from(pushSubscription).get()
    return (
      row && {
        endpoint: row.endpoint,
        expirationTime: row.expirationTime,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }
    )
  }

  async function deliver(notification: PushNotification): Promise<SendNowResult> {
    const subscription = currentSubscription()
    if (!subscription) return 'no-subscription'
    let outcome: SendOutcome
    try {
      outcome = await transport.send(subscription, toPushPayload(notification))
    } catch (error) {
      outcome = { status: 'failed', reason: String(error) }
    }
    if (outcome.status === 'failed') logger.warn({ reason: outcome.reason }, 'push failed')
    if (outcome.status === 'gone') {
      // This very subscription only: one registered while the push was in flight stays.
      const { endpoint, keys } = subscription
      db.delete(pushSubscription)
        .where(
          and(
            eq(pushSubscription.endpoint, endpoint),
            eq(pushSubscription.p256dh, keys.p256dh),
            eq(pushSubscription.auth, keys.auth),
          ),
        )
        .run()
      logger.info('push subscription gone: dropped')
    }
    return outcome.status
  }

  async function sendDue() {
    try {
      const time = now()
      // Claimed before the first send: a restart or a schedule replaced mid-send can never
      // send them twice.
      const due = db.transaction((tx) => {
        const entries = tx
          .select()
          .from(scheduledNotifications)
          .where(lte(scheduledNotifications.sendAt, time))
          .orderBy(asc(scheduledNotifications.sendAt), asc(scheduledNotifications.id))
          .all()
        tx.delete(scheduledNotifications).where(lte(scheduledNotifications.sendAt, time)).run()
        return entries
      })
      for (const entry of due) {
        const sendAt = entry.sendAt.toISOString()
        if (time.getTime() - entry.sendAt.getTime() > MAX_LATENESS_MS) {
          logger.info({ sendAt }, 'scheduled push dropped: overdue')
        } else if ((await deliver(entry)) === 'no-subscription') {
          logger.info({ sendAt }, 'scheduled push dropped: no subscription')
        }
      }
    } catch (error) {
      logger.error({ err: error }, 'send loop failed')
    }
  }

  return {
    registerSubscription({ endpoint, expirationTime, keys: { p256dh, auth } }) {
      const row = { endpoint, expirationTime, p256dh, auth }
      db.insert(pushSubscription)
        .values({ id: SUBSCRIPTION_ROW, ...row })
        .onConflictDoUpdate({ target: pushSubscription.id, set: row })
        .run()
    },

    replaceSchedule(notifications) {
      const time = now().getTime()
      const upcoming = notifications
        .map(({ sendAt, title, body, screen }) => ({
          sendAt: new Date(Date.parse(sendAt)),
          title,
          body,
          screen,
        }))
        .filter((entry) => entry.sendAt.getTime() > time)
      // Inserted in upload order: the ids then break ties between entries due at the same instant.
      db.transaction((tx) => {
        tx.delete(scheduledNotifications).run()
        if (upcoming.length > 0) tx.insert(scheduledNotifications).values(upcoming).run()
      })
    },

    sendNow: deliver,

    tick() {
      inFlight ??= sendDue().finally(() => {
        inFlight = undefined
      })
      return inFlight
    },
  }
}

/**
 * Runs the send loop now and every `intervalMs`. `stop` ends it and resolves once the run in
 * flight, if any, is over: the database can then be closed.
 */
export function startSendLoop(sender: PushSender, intervalMs: number) {
  let last = sender.tick()
  const timer = setInterval(() => {
    last = sender.tick()
  }, intervalMs)
  return {
    stop() {
      clearInterval(timer)
      return last
    },
  }
}
