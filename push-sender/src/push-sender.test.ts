import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp } from './http.ts'
import { createSender } from './sender.ts'
import { createStateFile } from './state-file.ts'
import type { PushSubscription, SendOutcome, Transport } from './types.ts'

const SECRET = 'a-shared-secret-of-at-least-32-characters'
const T0 = Date.parse('2026-10-01T08:00:00Z')
const MINUTE = 60_000

const PHONE: PushSubscription = {
  endpoint: 'https://web.push.apple.com/phone-1',
  expirationTime: null,
  keys: { p256dh: 'BPhone1p256dhKey', auth: 'phone1-auth' },
}
const NEW_PHONE: PushSubscription = {
  endpoint: 'https://web.push.apple.com/phone-2',
  expirationTime: null,
  keys: { p256dh: 'BPhone2p256dhKey', auth: 'phone2-auth' },
}

const at = (ms: number) => new Date(ms).toISOString()

interface Sent {
  endpoint: string
  payload: unknown
}

const dirs: string[] = []

afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function setup() {
  const dir = await mkdtemp(join(tmpdir(), 'push-sender-'))
  dirs.push(dir)
  const path = join(dir, 'state.json')
  const clock = { now: T0 }
  const sent: Sent[] = []
  const outcomes = new Map<string, SendOutcome | 'throw'>()
  const transport: Transport = {
    async send(subscription, payload) {
      const outcome = outcomes.get(subscription.endpoint) ?? { status: 'sent' }
      if (outcome === 'throw') throw new Error('socket hang up')
      if (outcome.status === 'sent') {
        sent.push({ endpoint: subscription.endpoint, payload: JSON.parse(payload) })
      }
      return outcome
    },
  }

  async function start() {
    const sender = await createSender({
      stateFile: createStateFile(path),
      transport,
      now: () => clock.now,
      log: () => {},
    })
    return { sender, app: createApp({ sender, sharedSecret: SECRET }) }
  }

  let current = await start()

  function request(method: string, route: string, body?: unknown, secret: string | null = SECRET) {
    const headers: Record<string, string> = { 'content-type': 'application/json' }
    if (secret !== null) headers.authorization = `Bearer ${secret}`
    return current.app.request(route, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  }

  return {
    clock,
    sent,
    outcomes,
    request,
    registerSubscription: (subscription: PushSubscription) =>
      request('PUT', '/subscription', subscription),
    replaceSchedule: (notifications: unknown[]) => request('PUT', '/schedule', { notifications }),
    tick: () => current.sender.tick(),
    /** Advances the clock to `ms` and runs the loop once, as the interval would. */
    tickAt: (ms: number) => {
      clock.now = ms
      return current.sender.tick()
    },
    restart: async () => {
      current = await start()
    },
  }
}

const notification = (sendAt: number, title: string) => ({
  sendAt: at(sendAt),
  title,
  body: `Body of ${title}`,
  screen: '/',
})

const titles = (sent: Sent[]) => sent.map((s) => (s.payload as { title: string }).title)

describe('shared secret', () => {
  it.each([
    ['no secret', null],
    ['a wrong secret', 'not-the-secret-not-the-secret-not-the-secret'],
  ])('rejects a request with %s and changes nothing', async (_, secret) => {
    const push = await setup()

    const register = await push.request('PUT', '/subscription', PHONE, secret)
    const schedule = await push.request(
      'PUT',
      '/schedule',
      { notifications: [notification(T0 + MINUTE, 'A')] },
      secret,
    )
    const test = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' }, secret)

    expect([register.status, schedule.status, test.status]).toEqual([401, 401, 401])
    await push.registerSubscription(PHONE)
    await push.tickAt(T0 + 2 * MINUTE)
    expect(push.sent).toEqual([])
  })

  it('rejects an unknown route without the secret', async () => {
    const push = await setup()

    const response = await push.request('GET', '/', undefined, null)

    expect(response.status).toBe(401)
  })
})

describe('subscription', () => {
  it('registers a subscription that the test push reaches', async () => {
    const push = await setup()

    const register = await push.registerSubscription(PHONE)
    const test = await push.request('POST', '/test', {
      title: 'Test',
      body: 'Ça marche',
      screen: '/',
    })

    expect(register.status).toBe(204)
    expect(test.status).toBe(204)
    expect(push.sent).toEqual([
      { endpoint: PHONE.endpoint, payload: { title: 'Test', body: 'Ça marche', screen: '/' } },
    ])
  })

  it('replaces the subscription: only the new one receives pushes', async () => {
    const push = await setup()

    await push.registerSubscription(PHONE)
    await push.registerSubscription(NEW_PHONE)
    await push.request('POST', '/test', { title: 'Test', body: 'B', screen: '/' })

    expect(push.sent.map((s) => s.endpoint)).toEqual([NEW_PHONE.endpoint])
  })

  it('is idempotent', async () => {
    const push = await setup()

    await push.registerSubscription(PHONE)
    await push.registerSubscription(PHONE)
    await push.request('POST', '/test', { title: 'Test', body: 'B', screen: '/' })

    expect(push.sent.map((s) => s.endpoint)).toEqual([PHONE.endpoint])
  })

  it.each([
    ['a non-https endpoint', { ...PHONE, endpoint: 'http://web.push.apple.com/x' }],
    ['missing keys', { endpoint: PHONE.endpoint }],
    ['an empty auth key', { ...PHONE, keys: { p256dh: 'BKey', auth: '' } }],
    ['not an object', 'subscription'],
  ])('refuses %s', async (_, body) => {
    const push = await setup()

    const response = await push.request('PUT', '/subscription', body)

    expect(response.status).toBe(400)
  })

  it('refuses a body that is not JSON', async () => {
    const push = await setup()

    const response = await push.request('PUT', '/subscription', undefined)

    expect(response.status).toBe(400)
  })
})

describe('test push', () => {
  it('answers 409 when no subscription is registered', async () => {
    const push = await setup()

    const response = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })

    expect(response.status).toBe(409)
  })

  it('drops a subscription the push service reports as gone and answers 410', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.outcomes.set(PHONE.endpoint, { status: 'gone' })

    const first = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })
    const second = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })

    expect([first.status, second.status]).toEqual([410, 409])
  })

  it('answers 502 when the push service fails', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.outcomes.set(PHONE.endpoint, { status: 'failed', reason: '500 from push service' })

    const response = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })

    expect(response.status).toBe(502)
  })

  it('refuses a notification with a screen outside the app', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)

    const response = await push.request('POST', '/test', {
      title: 'T',
      body: 'B',
      screen: 'https://elsewhere.example/',
    })

    expect(response.status).toBe(400)
    expect(push.sent).toEqual([])
  })
})

describe('schedule', () => {
  it('sends due entries exactly once, in sendAt order', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    const response = await push.replaceSchedule([
      notification(T0 + 20 * MINUTE, 'third'),
      notification(T0 + 5 * MINUTE, 'first'),
      notification(T0 + 10 * MINUTE, 'second'),
      notification(T0 + 60 * MINUTE, 'later'),
    ])

    await push.tickAt(T0 + 4 * MINUTE)
    await push.tickAt(T0 + 5 * MINUTE)
    await push.tickAt(T0 + 5 * MINUTE)
    await push.tickAt(T0 + 25 * MINUTE)
    await push.tickAt(T0 + 26 * MINUTE)

    expect(response.status).toBe(204)
    expect(titles(push.sent)).toEqual(['first', 'second', 'third'])
    expect(push.sent[0]?.payload).toEqual({ title: 'first', body: 'Body of first', screen: '/' })
  })

  it('never sends entries replaced before their time', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'kept'),
      notification(T0 + 30 * MINUTE, 'made wrong by a lapse'),
    ])
    await push.tickAt(T0 + 10 * MINUTE)

    await push.replaceSchedule([notification(T0 + 40 * MINUTE, 'rebuilt')])
    await push.tickAt(T0 + 60 * MINUTE)

    expect(titles(push.sent)).toEqual(['kept', 'rebuilt'])
  })

  it('is idempotent: uploading the same schedule twice sends each entry once', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    const schedule = [notification(T0 + 5 * MINUTE, 'A'), notification(T0 + 10 * MINUTE, 'B')]

    await push.replaceSchedule(schedule)
    await push.replaceSchedule(schedule)
    await push.tickAt(T0 + 20 * MINUTE)

    expect(titles(push.sent)).toEqual(['A', 'B'])
  })

  it('discards entries already in the past when the schedule is uploaded', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.clock.now = T0 + 10 * MINUTE

    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'already sent before the re-upload'),
      notification(T0 + 15 * MINUTE, 'upcoming'),
    ])
    await push.tickAt(T0 + 20 * MINUTE)

    expect(titles(push.sent)).toEqual(['upcoming'])
  })

  it('drops due entries while no subscription is registered, instead of flushing them later', async () => {
    const push = await setup()
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'nobody to send to'),
      notification(T0 + 30 * MINUTE, 'after registering'),
    ])
    await push.tickAt(T0 + 10 * MINUTE)

    await push.registerSubscription(PHONE)
    await push.tickAt(T0 + 30 * MINUTE)

    expect(titles(push.sent)).toEqual(['after registering'])
  })

  it('drops an entry overdue by more than an hour instead of sending it late', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'stale'),
      notification(T0 + 64 * MINUTE, 'just due'),
    ])

    await push.tickAt(T0 + 66 * MINUTE)

    expect(titles(push.sent)).toEqual(['just due'])
  })

  it.each([
    ['an invalid sendAt', { ...notification(T0, 'x'), sendAt: 'tomorrow' }],
    ['an empty title', { ...notification(T0 + MINUTE, 'x'), title: '' }],
    ['a screen outside the app', { ...notification(T0 + MINUTE, 'x'), screen: '//evil.test' }],
    ['a missing body', { sendAt: at(T0 + MINUTE), title: 'x', screen: '/' }],
  ])('refuses a schedule with %s and keeps the previous one', async (_, entry) => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([notification(T0 + 5 * MINUTE, 'previous')])

    const response = await push.replaceSchedule([notification(T0 + 6 * MINUTE, 'valid'), entry])
    await push.tickAt(T0 + 10 * MINUTE)

    expect(response.status).toBe(400)
    expect(titles(push.sent)).toEqual(['previous'])
  })

  it('accepts an empty schedule, which cancels every upcoming entry', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([notification(T0 + 5 * MINUTE, 'cancelled')])

    const response = await push.replaceSchedule([])
    await push.tickAt(T0 + 10 * MINUTE)

    expect(response.status).toBe(204)
    expect(push.sent).toEqual([])
  })
})

describe('send loop failures', () => {
  it('drops a subscription reported gone, skips the rest, and keeps running', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'gone'),
      notification(T0 + 6 * MINUTE, 'skipped'),
      notification(T0 + 30 * MINUTE, 'to the new subscription'),
    ])
    push.outcomes.set(PHONE.endpoint, { status: 'gone' })

    await push.tickAt(T0 + 10 * MINUTE)
    const test = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })
    await push.registerSubscription(NEW_PHONE)
    await push.tickAt(T0 + 30 * MINUTE)

    expect(test.status).toBe(409)
    expect(push.sent).toEqual([
      {
        endpoint: NEW_PHONE.endpoint,
        payload: {
          title: 'to the new subscription',
          body: 'Body of to the new subscription',
          screen: '/',
        },
      },
    ])
  })

  it('survives a failing or throwing transport and does not retry the entry', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'failed'),
      notification(T0 + 20 * MINUTE, 'thrown'),
      notification(T0 + 40 * MINUTE, 'delivered'),
    ])

    push.outcomes.set(PHONE.endpoint, { status: 'failed', reason: '503' })
    await push.tickAt(T0 + 10 * MINUTE)
    push.outcomes.set(PHONE.endpoint, 'throw')
    await push.tickAt(T0 + 25 * MINUTE)
    push.outcomes.delete(PHONE.endpoint)
    await push.tickAt(T0 + 26 * MINUTE)
    await push.tickAt(T0 + 40 * MINUTE)

    expect(titles(push.sent)).toEqual(['delivered'])
  })
})

describe('persistence', () => {
  it('keeps the subscription and the schedule across a restart', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(T0 + 5 * MINUTE, 'before restart'),
      notification(T0 + 30 * MINUTE, 'after restart'),
    ])
    await push.tickAt(T0 + 10 * MINUTE)

    await push.restart()
    await push.tick()
    await push.tickAt(T0 + 30 * MINUTE)

    expect(titles(push.sent)).toEqual(['before restart', 'after restart'])
  })

  it('does not bring a gone subscription back after a restart', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.outcomes.set(PHONE.endpoint, { status: 'gone' })
    await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })

    await push.restart()
    const response = await push.request('POST', '/test', { title: 'T', body: 'B', screen: '/' })

    expect(response.status).toBe(409)
  })
})
