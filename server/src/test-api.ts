import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { type PushNotification, pushNotificationSchema } from '@quit/contract/push'
import { createApp } from './app.ts'
import { openDatabase } from './database.ts'
import { issueDeviceKey } from './device-keys.ts'
import { createLogger } from './logger.ts'
import { createPushSender, type SendOutcome, type Transport } from './push-sender.ts'

/**
 * The server as the tests drive it: the real app on a free port, backed by a real SQLite file
 * in a temporary directory, with the clock and the push service faked.
 */

export const T0 = new Date('2026-10-01T08:00:00Z')

export interface RequestOptions {
  key?: string | null
  /** Sent as is, with a JSON content type. */
  body?: string
  authorization?: string
  /** The client address a proxy in front would forward. */
  forwardedFor?: string
}

/** What reached the push service: the endpoint and the payload, parsed. */
export interface SentPush {
  endpoint: string
  payload: PushNotification
}

const cleanups: (() => Promise<void>)[] = []

/** Stops every server the test started and deletes its data; call it in `afterEach`. */
export async function closeTestApis() {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup()
}

export async function openTestApi({ trustProxyHops = 0 } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'quit-server-'))
  cleanups.push(() => rm(dir, { recursive: true, force: true }))
  const clock = { now: T0.getTime() }
  const logs: string[] = []
  const logger = createLogger('info', { write: (line: string) => void logs.push(line) })

  const sent: SentPush[] = []
  /** What the push service answers for an endpoint; a push it accepts by default. */
  const outcomes = new Map<string, SendOutcome | 'throw'>()
  const transport: Transport = {
    async send(subscription, payload) {
      const outcome = outcomes.get(subscription.endpoint) ?? { status: 'sent' }
      if (outcome === 'throw') throw new Error('socket hang up')
      if (outcome.status === 'sent') {
        sent.push({
          endpoint: subscription.endpoint,
          payload: pushNotificationSchema.parse(JSON.parse(payload)),
        })
      }
      return outcome
    },
  }

  async function start() {
    const database = openDatabase(dir)
    const pushSender = createPushSender({
      db: database.db,
      transport,
      now: () => new Date(clock.now),
      logger,
    })
    const server = createApp({ database, logger, trustProxyHops, pushSender }).listen(
      0,
      '127.0.0.1',
    )
    await once(server, 'listening')
    const { port } = server.address() as AddressInfo
    const stop = async () => {
      await new Promise((resolve) => server.close(resolve))
      database.close()
    }
    return { database, pushSender, port, stop }
  }

  let current = await start()
  cleanups.push(() => current.stop())

  function request(method: string, path: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {}
    if (options.body !== undefined) headers['content-type'] = 'application/json'
    if (options.authorization !== undefined) headers.authorization = options.authorization
    else if (options.key) headers.authorization = `Bearer ${options.key}`
    if (options.forwardedFor) headers['x-forwarded-for'] = options.forwardedFor
    return fetch(`http://127.0.0.1:${current.port}${path}`, {
      method,
      headers,
      ...(options.body === undefined ? {} : { body: options.body }),
    })
  }

  return {
    get database() {
      return current.database
    },
    clock,
    logs,
    sent,
    outcomes,
    request,
    /** What the issue command does, at T0. */
    issueKey: () => issueDeviceKey(current.database.db, T0),
    /** Runs the send loop once, as its interval would. */
    tick: () => current.pushSender.tick(),
    /** Stops the server and starts a new one on the same data directory. */
    restart: async () => {
      await current.stop()
      current = await start()
    },
  }
}

export type TestApi = Awaited<ReturnType<typeof openTestApi>>
