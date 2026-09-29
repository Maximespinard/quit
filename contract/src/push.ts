import * as z from 'zod/mini'

/**
 * The push API's bodies (ADR-0001): the app computes ready-made notifications, the server
 * stores them and sends each one when due, knowing nothing of what they say.
 */

/** 30 days of a few pushes a day fit many times over; anything bigger is a mistake. */
export const MAX_SCHEDULE_LENGTH = 1000
/** Web push payloads are capped at 4 KB once encrypted; this keeps headroom for the overhead. */
export const MAX_PUSH_PAYLOAD_BYTES = 3000

const nonEmptyString = z.string().check(z.minLength(1))

/** The browser's `PushSubscription.toJSON()`, as the app uploads it. */
export const pushSubscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }),
  /** Epoch ms, or `null` (also when left out) for a subscription that does not expire. */
  expirationTime: z._default(z.nullable(z.number()), null),
  keys: z.object({ p256dh: nonEmptyString, auth: nonEmptyString }),
})
export type PushSubscription = z.infer<typeof pushSubscriptionSchema>

/** A path of the app itself: `/…` but not `//host`, which a browser reads as another origin. */
const isAppPath = (value: string) => value.startsWith('/') && !value.startsWith('//')

/** What the service worker receives: the notification without its schedule time. */
export const toPushPayload = ({ title, body, screen }: PushNotification): string =>
  JSON.stringify({ title, body, screen })

/**
 * UTF-8 byte length, computed by hand: the contract compiles against the ES lib alone, which
 * has no `TextEncoder` nor `Buffer`.
 */
function utf8Length(text: string) {
  let bytes = 0
  for (const character of text) {
    const codePoint = character.codePointAt(0) ?? 0
    bytes += codePoint < 0x80 ? 1 : codePoint < 0x800 ? 2 : codePoint < 0x10000 ? 3 : 4
  }
  return bytes
}

const fitsOnePush = (notification: PushNotification) =>
  utf8Length(toPushPayload(notification)) <= MAX_PUSH_PAYLOAD_BYTES

const notificationShape = {
  title: nonEmptyString,
  body: z.string(),
  /** The app route the notification opens. */
  screen: z.string().check(z.refine(isAppPath)),
}

/** A ready-made notification: shown as is. */
export const pushNotificationSchema = z.object(notificationShape).check(z.refine(fitsOnePush))
export type PushNotification = z.infer<typeof pushNotificationSchema>

/** A notification and when to send it: an ISO 8601 date-time. */
export const scheduledPushNotificationSchema = z
  .object({
    ...notificationShape,
    sendAt: z.string().check(z.refine((value) => Number.isFinite(Date.parse(value)))),
  })
  .check(z.refine(fitsOnePush))
export type ScheduledPushNotification = z.infer<typeof scheduledPushNotificationSchema>

/** The whole schedule: each upload replaces the previous one. */
export const pushScheduleSchema = z.object({
  notifications: z.array(scheduledPushNotificationSchema).check(z.maxLength(MAX_SCHEDULE_LENGTH)),
})
export type PushSchedule = z.infer<typeof pushScheduleSchema>
