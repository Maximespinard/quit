/** The browser's `PushSubscription.toJSON()`, as the app uploads it. */
export interface PushSubscription {
  endpoint: string
  expirationTime: number | null
  keys: { p256dh: string; auth: string }
}

/** A ready-made notification: the sender shows it as is and knows nothing about its meaning. */
export interface Notification {
  title: string
  body: string
  /** App route the notification opens, always a path of the app itself (`/…`). */
  screen: string
}

export interface ScheduledNotification extends Notification {
  /** Epoch milliseconds. */
  sendAt: number
}

export interface State {
  subscription: PushSubscription | null
  /** Upcoming notifications, sorted by `sendAt`. */
  schedule: ScheduledNotification[]
}

export type SendOutcome =
  | { status: 'sent' }
  /** The push service no longer knows the subscription (404/410): it will never work again. */
  | { status: 'gone' }
  | { status: 'failed'; reason: string }

export interface Transport {
  send(subscription: PushSubscription, payload: string): Promise<SendOutcome>
}
