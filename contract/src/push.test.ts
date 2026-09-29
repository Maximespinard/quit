import { describe, expect, it } from 'vitest'
import {
  MAX_PUSH_PAYLOAD_BYTES,
  MAX_SCHEDULE_LENGTH,
  pushNotificationSchema,
  pushScheduleSchema,
  pushSubscriptionSchema,
} from './push.ts'

const SUBSCRIPTION = {
  endpoint: 'https://web.push.apple.com/phone-1',
  expirationTime: null,
  keys: { p256dh: 'BPhone1p256dhKey', auth: 'phone1-auth' },
}
const NOTIFICATION = { title: 'Patch', body: 'Nouveau patch ce matin.', screen: '/' }
const ENTRY = { ...NOTIFICATION, sendAt: '2026-10-01T08:00:00.000Z' }

describe('pushSubscriptionSchema', () => {
  it('reads a subscription, a missing expiration time reading as none', () => {
    const { expirationTime: _, ...withoutExpiration } = SUBSCRIPTION

    expect(pushSubscriptionSchema.parse(SUBSCRIPTION)).toEqual(SUBSCRIPTION)
    expect(pushSubscriptionSchema.parse(withoutExpiration)).toEqual(SUBSCRIPTION)
  })

  it.each([
    ['a non-https endpoint', { ...SUBSCRIPTION, endpoint: 'http://web.push.apple.com/x' }],
    ['an endpoint that is not a URL', { ...SUBSCRIPTION, endpoint: 'phone-1' }],
    ['an expiration time that is not a number', { ...SUBSCRIPTION, expirationTime: 'soon' }],
    ['an empty p256dh key', { ...SUBSCRIPTION, keys: { p256dh: '', auth: 'a' } }],
  ])('refuses %s', (_, body) => {
    expect(pushSubscriptionSchema.safeParse(body).success).toBe(false)
  })
})

describe('pushNotificationSchema', () => {
  it('reads a notification and drops what is not part of it', () => {
    expect(pushNotificationSchema.parse({ ...NOTIFICATION, badge: 1 })).toEqual(NOTIFICATION)
  })

  it('accepts an empty body', () => {
    expect(pushNotificationSchema.safeParse({ ...NOTIFICATION, body: '' }).success).toBe(true)
  })

  it.each([
    ['a screen on another origin', { ...NOTIFICATION, screen: '//evil.test' }],
    ['a screen that is a URL', { ...NOTIFICATION, screen: 'https://elsewhere.example/' }],
    ['an empty title', { ...NOTIFICATION, title: '' }],
    [
      'a payload too big for one push',
      { ...NOTIFICATION, body: 'x'.repeat(MAX_PUSH_PAYLOAD_BYTES) },
    ],
    // 1000 characters, but 3000 bytes once encoded.
    ['a payload counted in bytes, not characters', { ...NOTIFICATION, body: '€'.repeat(1000) }],
  ])('refuses %s', (_, body) => {
    expect(pushNotificationSchema.safeParse(body).success).toBe(false)
  })
})

describe('pushScheduleSchema', () => {
  it('reads a schedule, empty included', () => {
    expect(pushScheduleSchema.parse({ notifications: [ENTRY] })).toEqual({ notifications: [ENTRY] })
    expect(pushScheduleSchema.parse({ notifications: [] })).toEqual({ notifications: [] })
  })

  it.each([
    ['an invalid sendAt', { notifications: [{ ...ENTRY, sendAt: 'tomorrow' }] }],
    ['a missing sendAt', { notifications: [NOTIFICATION] }],
    ['too many entries', { notifications: Array(MAX_SCHEDULE_LENGTH + 1).fill(ENTRY) }],
    ['no notifications list', {}],
  ])('refuses %s', (_, body) => {
    expect(pushScheduleSchema.safeParse(body).success).toBe(false)
  })
})
