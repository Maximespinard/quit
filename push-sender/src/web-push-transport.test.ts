import { describe, expect, it } from 'vitest'
import webPush from 'web-push'
import type { PushSubscription } from './types.ts'
import { createWebPushTransport } from './web-push-transport.ts'

const VAPID = {
  subject: 'mailto:owner@example.com',
  publicKey: 'BPublicKey',
  privateKey: 'private-key',
}
const PHONE: PushSubscription = {
  endpoint: 'https://web.push.apple.com/phone-1',
  expirationTime: null,
  keys: { p256dh: 'BPhone1p256dhKey', auth: 'phone1-auth' },
}

const answering = (statusCode: number) => async () => {
  throw new webPush.WebPushError('Received unexpected response code', statusCode, {}, '', '')
}

describe('web push transport', () => {
  it('signs with the VAPID keys and a positive TTL', async () => {
    const calls: unknown[][] = []
    const transport = createWebPushTransport(VAPID, async (...args) => {
      calls.push(args)
      return { statusCode: 201, body: '', headers: {} }
    })

    const outcome = await transport.send(PHONE, '{"title":"T"}')

    expect(outcome).toEqual({ status: 'sent' })
    expect(calls).toEqual([
      [PHONE, '{"title":"T"}', { vapidDetails: VAPID, TTL: 3600, urgency: 'high' }],
    ])
  })

  it.each([404, 410])('reports a %i as a gone subscription', async (statusCode) => {
    const transport = createWebPushTransport(VAPID, answering(statusCode))

    expect(await transport.send(PHONE, '{}')).toEqual({ status: 'gone' })
  })

  it.each([400, 403, 413, 429, 500])('reports a %i as a failure', async (statusCode) => {
    const transport = createWebPushTransport(VAPID, answering(statusCode))

    expect(await transport.send(PHONE, '{}')).toEqual({
      status: 'failed',
      reason: `push service answered ${statusCode}`,
    })
  })

  it('reports a network error as a failure', async () => {
    const transport = createWebPushTransport(VAPID, async () => {
      throw new Error('getaddrinfo ENOTFOUND web.push.apple.com')
    })

    expect(await transport.send(PHONE, '{}')).toEqual({
      status: 'failed',
      reason: 'Error: getaddrinfo ENOTFOUND web.push.apple.com',
    })
  })
})
