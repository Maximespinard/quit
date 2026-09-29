import { PROBLEM_CONTENT_TYPE } from '@quit/contract/problem'
import type { PushSubscription } from '@quit/contract/push'
import { sql } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { closeTestApis, openTestApi, type SentPush, T0 } from './test-api.ts'

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
const TEST_PUSH = { title: 'T', body: 'B', screen: '/' }

const t = (minutes: number) => T0.getTime() + minutes * MINUTE
const at = (ms: number) => new Date(ms).toISOString()

afterEach(closeTestApis)

async function setup() {
  const api = await openTestApi()
  const key = api.issueKey()

  /** A request to `/api/push<route>` with this JSON body, carrying the device key by default. */
  function send(method: string, route: string, body?: unknown, deviceKey: string | null = key) {
    return api.request(method, `/api/push${route}`, {
      key: deviceKey,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  }

  return {
    api,
    key,
    send,
    registerSubscription: (subscription: unknown) => send('PUT', '/subscription', subscription),
    replaceSchedule: (notifications: unknown[]) => send('PUT', '/schedule', { notifications }),
    testPush: (body: unknown = TEST_PUSH) => send('POST', '/test', body),
    /** Advances the clock to `ms` and runs the send loop once, as its interval would. */
    tickAt: (ms: number) => {
      api.clock.now = ms
      return api.tick()
    },
  }
}

const notification = (sendAt: number, title: string) => ({
  sendAt: at(sendAt),
  title,
  body: `Body of ${title}`,
  screen: '/',
})

const titles = (sent: SentPush[]) => sent.map((push) => push.payload.title)

describe('device key', () => {
  it.each([
    ['no key', null],
    ['a wrong key', 'not-the-device-key-not-the-device-key-000'],
  ])('rejects a request with %s and changes nothing', async (_, deviceKey) => {
    const push = await setup()
    await push.registerSubscription(PHONE)

    const register = await push.send('PUT', '/subscription', NEW_PHONE, deviceKey)
    const schedule = await push.send(
      'PUT',
      '/schedule',
      { notifications: [notification(t(1), 'A')] },
      deviceKey,
    )
    const test = await push.send('POST', '/test', TEST_PUSH, deviceKey)

    expect([register.status, schedule.status, test.status]).toEqual([401, 401, 401])
    await push.tickAt(t(2))
    expect(push.api.sent).toEqual([])
    await push.testPush()
    expect(push.api.sent.map((s) => s.endpoint)).toEqual([PHONE.endpoint])
  })
})

describe('subscription', () => {
  it('registers a subscription that the test push reaches', async () => {
    const push = await setup()

    const register = await push.registerSubscription(PHONE)
    const test = await push.testPush({ title: 'Test', body: 'Ça marche', screen: '/' })

    expect(register.status).toBe(204)
    expect(test.status).toBe(204)
    expect(push.api.sent).toEqual([
      { endpoint: PHONE.endpoint, payload: { title: 'Test', body: 'Ça marche', screen: '/' } },
    ])
  })

  it('replaces the subscription: only the new one receives pushes', async () => {
    const push = await setup()

    await push.registerSubscription(PHONE)
    await push.registerSubscription(NEW_PHONE)
    await push.testPush()

    expect(push.api.sent.map((s) => s.endpoint)).toEqual([NEW_PHONE.endpoint])
  })

  it('is idempotent', async () => {
    const push = await setup()

    await push.registerSubscription(PHONE)
    await push.registerSubscription(PHONE)
    await push.testPush()

    expect(push.api.sent.map((s) => s.endpoint)).toEqual([PHONE.endpoint])
  })

  it.each([
    ['a non-https endpoint', { ...PHONE, endpoint: 'http://web.push.apple.com/x' }],
    ['missing keys', { endpoint: PHONE.endpoint }],
    ['an empty auth key', { ...PHONE, keys: { p256dh: 'BKey', auth: '' } }],
    ['not an object', 'subscription'],
  ])('refuses %s with a problem', async (_, body) => {
    const push = await setup()

    const response = await push.registerSubscription(body)

    expect(response.status).toBe(400)
    expect(response.headers.get('content-type')).toContain(PROBLEM_CONTENT_TYPE)
  })

  it.each([
    ['a body that is not JSON', 'subscription'],
    ['an empty body', ''],
  ])('refuses %s', async (_, body) => {
    const push = await setup()

    const response = await push.api.request('PUT', '/api/push/subscription', {
      key: push.key,
      body,
    })

    expect(response.status).toBe(400)
  })
})

describe('test push', () => {
  it('answers 409 when no subscription is registered', async () => {
    const push = await setup()

    const response = await push.testPush()

    expect(response.status).toBe(409)
  })

  it('drops a subscription the push service reports as gone and answers 410', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.api.outcomes.set(PHONE.endpoint, { status: 'gone' })

    const first = await push.testPush()
    const second = await push.testPush()

    expect([first.status, second.status]).toEqual([410, 409])
  })

  it('answers 502 when the push service fails', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.api.outcomes.set(PHONE.endpoint, { status: 'failed', reason: '500 from push service' })

    const response = await push.testPush()

    expect(response.status).toBe(502)
  })

  it('answers 502 when the push transport throws', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.api.outcomes.set(PHONE.endpoint, 'throw')

    const response = await push.testPush()

    expect(response.status).toBe(502)
  })

  it('refuses a notification with a screen outside the app', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)

    const response = await push.testPush({ ...TEST_PUSH, screen: 'https://elsewhere.example/' })

    expect(response.status).toBe(400)
    expect(push.api.sent).toEqual([])
  })
})

describe('schedule', () => {
  it('sends due entries exactly once, in sendAt order', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    const response = await push.replaceSchedule([
      notification(t(20), 'third'),
      notification(t(5), 'first'),
      notification(t(10), 'second'),
      notification(t(60), 'later'),
    ])

    await push.tickAt(t(4))
    await push.tickAt(t(5))
    await push.tickAt(t(5))
    await push.tickAt(t(25))
    await push.tickAt(t(26))

    expect(response.status).toBe(204)
    expect(titles(push.api.sent)).toEqual(['first', 'second', 'third'])
    expect(push.api.sent[0]?.payload).toEqual({
      title: 'first',
      body: 'Body of first',
      screen: '/',
    })
  })

  it('never sends entries replaced before their time', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(t(5), 'kept'),
      notification(t(30), 'made wrong by a lapse'),
    ])
    await push.tickAt(t(10))

    await push.replaceSchedule([notification(t(40), 'rebuilt')])
    await push.tickAt(t(60))

    expect(titles(push.api.sent)).toEqual(['kept', 'rebuilt'])
  })

  it('is idempotent: uploading the same schedule twice sends each entry once', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    const schedule = [notification(t(5), 'A'), notification(t(10), 'B')]

    await push.replaceSchedule(schedule)
    await push.replaceSchedule(schedule)
    await push.tickAt(t(20))

    expect(titles(push.api.sent)).toEqual(['A', 'B'])
  })

  it('discards entries already in the past when the schedule is uploaded', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.api.clock.now = t(10)

    await push.replaceSchedule([
      notification(t(5), 'already sent before the re-upload'),
      notification(t(15), 'upcoming'),
    ])
    await push.tickAt(t(20))

    expect(titles(push.api.sent)).toEqual(['upcoming'])
  })

  it('drops due entries while no subscription is registered, instead of flushing them later', async () => {
    const push = await setup()
    await push.replaceSchedule([
      notification(t(5), 'nobody to send to'),
      notification(t(30), 'after registering'),
    ])
    await push.tickAt(t(10))

    await push.registerSubscription(PHONE)
    await push.tickAt(t(30))

    expect(titles(push.api.sent)).toEqual(['after registering'])
  })

  it('drops an entry overdue by more than an hour instead of sending it late', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([notification(t(5), 'stale'), notification(t(64), 'just due')])

    await push.tickAt(t(66))

    expect(titles(push.api.sent)).toEqual(['just due'])
  })

  it.each([
    ['an invalid sendAt', { ...notification(T0.getTime(), 'x'), sendAt: 'tomorrow' }],
    ['an empty title', { ...notification(t(1), 'x'), title: '' }],
    ['a screen outside the app', { ...notification(t(1), 'x'), screen: '//evil.test' }],
    ['a missing body', { sendAt: at(t(1)), title: 'x', screen: '/' }],
  ])('refuses a schedule with %s and keeps the previous one', async (_, entry) => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([notification(t(5), 'previous')])

    const response = await push.replaceSchedule([notification(t(6), 'valid'), entry])
    await push.tickAt(t(10))

    expect(response.status).toBe(400)
    expect(titles(push.api.sent)).toEqual(['previous'])
  })

  it('accepts an empty schedule, which cancels every upcoming entry', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([notification(t(5), 'cancelled')])

    const response = await push.replaceSchedule([])
    await push.tickAt(t(10))

    expect(response.status).toBe(204)
    expect(push.api.sent).toEqual([])
  })
})

describe('database failures', () => {
  it('answers 500 and logs the database error without the values it carried', async () => {
    const push = await setup()
    const secret = 'three-cravings-today-must-stay-private'
    // Fails the insert once prepared, as a full disk would.
    push.api.database.db.run(
      sql`CREATE TRIGGER fail BEFORE INSERT ON scheduled_notifications BEGIN SELECT RAISE(ABORT, 'disk full'); END`,
    )

    const response = await push.replaceSchedule([{ ...notification(t(5), 'x'), body: secret }])

    expect(response.status).toBe(500)
    expect(push.api.logs.join('\n')).toContain('disk full')
    expect(push.api.logs.join('\n')).not.toContain(secret)
  })
})

describe('send loop failures', () => {
  it('drops a subscription reported gone, skips the rest, and keeps running', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(t(5), 'gone'),
      notification(t(6), 'skipped'),
      notification(t(30), 'to the new subscription'),
    ])
    push.api.outcomes.set(PHONE.endpoint, { status: 'gone' })

    await push.tickAt(t(10))
    const test = await push.testPush()
    await push.registerSubscription(NEW_PHONE)
    await push.tickAt(t(30))

    expect(test.status).toBe(409)
    expect(push.api.sent).toEqual([
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
      notification(t(5), 'failed'),
      notification(t(20), 'thrown'),
      notification(t(40), 'delivered'),
    ])

    push.api.outcomes.set(PHONE.endpoint, { status: 'failed', reason: '503' })
    await push.tickAt(t(10))
    push.api.outcomes.set(PHONE.endpoint, 'throw')
    await push.tickAt(t(25))
    push.api.outcomes.delete(PHONE.endpoint)
    await push.tickAt(t(26))
    await push.tickAt(t(40))

    expect(titles(push.api.sent)).toEqual(['delivered'])
  })

  it('logs a failed push without the notification text', async () => {
    const push = await setup()
    const secret = 'three-cravings-today-must-stay-private'
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([{ ...notification(t(5), 'failed'), body: secret }])
    push.api.outcomes.set(PHONE.endpoint, { status: 'failed', reason: '503' })

    await push.tickAt(t(10))

    const lines = push.api.logs.map((line) => JSON.parse(line))
    expect(lines).toContainEqual(expect.objectContaining({ msg: 'push failed', reason: '503' }))
    expect(push.api.logs.join('\n')).not.toContain(secret)
  })
})

describe('persistence', () => {
  it('keeps the subscription and the schedule across a restart', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    await push.replaceSchedule([
      notification(t(5), 'before restart'),
      notification(t(30), 'after restart'),
    ])
    await push.tickAt(t(10))

    await push.api.restart()
    await push.api.tick()
    await push.tickAt(t(30))

    expect(titles(push.api.sent)).toEqual(['before restart', 'after restart'])
  })

  it('does not bring a gone subscription back after a restart', async () => {
    const push = await setup()
    await push.registerSubscription(PHONE)
    push.api.outcomes.set(PHONE.endpoint, { status: 'gone' })
    await push.testPush()

    await push.api.restart()
    const response = await push.testPush()

    expect(response.status).toBe(409)
  })
})
