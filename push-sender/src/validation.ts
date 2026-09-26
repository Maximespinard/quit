import type { Notification, PushSubscription, ScheduledNotification, State } from './types.ts'

/** 30 days of a few pushes a day fit many times over; anything bigger is a mistake. */
const MAX_SCHEDULE_LENGTH = 1000
/** Web push payloads are capped at 4 KB once encrypted; keep headroom for the overhead. */
const MAX_PAYLOAD_BYTES = 3000

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !URL.canParse(value)) return false
  return new URL(value).protocol === 'https:'
}

/** A path of the app itself: `/…` but not `//host`, which a browser reads as another origin. */
const isAppPath = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')

export function parseSubscription(value: unknown): PushSubscription | null {
  if (!isRecord(value) || !isHttpsUrl(value.endpoint) || !isRecord(value.keys)) return null
  const { p256dh, auth } = value.keys
  if (!isNonEmptyString(p256dh) || !isNonEmptyString(auth)) return null
  const expirationTime = value.expirationTime ?? null
  if (expirationTime !== null && typeof expirationTime !== 'number') return null
  return { endpoint: value.endpoint, expirationTime, keys: { p256dh, auth } }
}

export function parseNotification(value: unknown): Notification | null {
  if (!isRecord(value)) return null
  const { title, body, screen } = value
  if (!isNonEmptyString(title) || typeof body !== 'string' || !isAppPath(screen)) return null
  const notification = { title, body, screen }
  if (Buffer.byteLength(toPayload(notification)) > MAX_PAYLOAD_BYTES) return null
  return notification
}

/** The upload format: `sendAt` is an ISO 8601 date-time. */
function parseUploadedEntry(value: unknown): ScheduledNotification | null {
  const notification = parseNotification(value)
  if (!notification || !isRecord(value) || typeof value.sendAt !== 'string') return null
  const sendAt = Date.parse(value.sendAt)
  return Number.isFinite(sendAt) ? { ...notification, sendAt } : null
}

/** `{ notifications: [...] }` → the entries sorted by `sendAt`, or null if any entry is invalid. */
export function parseSchedule(value: unknown): ScheduledNotification[] | null {
  if (!isRecord(value) || !Array.isArray(value.notifications)) return null
  if (value.notifications.length > MAX_SCHEDULE_LENGTH) return null
  const entries: ScheduledNotification[] = []
  for (const item of value.notifications) {
    const entry = parseUploadedEntry(item)
    if (!entry) return null
    entries.push(entry)
  }
  return entries.sort((a, b) => a.sendAt - b.sendAt)
}

/** The state file as written by `createStateFile`, where `sendAt` is already epoch ms. */
export function parseState(value: unknown): State | null {
  if (!isRecord(value) || !Array.isArray(value.schedule)) return null
  const subscription = value.subscription === null ? null : parseSubscription(value.subscription)
  if (value.subscription !== null && !subscription) return null
  const schedule: ScheduledNotification[] = []
  for (const item of value.schedule) {
    const notification = parseNotification(item)
    if (!notification || !isRecord(item) || typeof item.sendAt !== 'number') return null
    schedule.push({ ...notification, sendAt: item.sendAt })
  }
  return { subscription, schedule }
}

/** What the service worker receives: the notification without its schedule time. */
export const toPayload = ({ title, body, screen }: Notification): string =>
  JSON.stringify({ title, body, screen })
