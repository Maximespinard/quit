import webPush from 'web-push'
import type { Transport } from './push-sender.ts'

export interface VapidDetails {
  /** `mailto:` or `https:` URL: Apple rejects any other JWT subject (`BadJwtToken`). */
  subject: string
  publicKey: string
  privateKey: string
}

/** How long the push service keeps a notification for an offline device, in seconds. */
const TTL_SECONDS = 60 * 60
/**
 * How long a push service gets to answer. Without it a hung connection would hold the send
 * loop, and the shutdown that waits for it, for good.
 */
const TIMEOUT_MS = 10_000

/** The real transport: web push through the `web-push` library, VAPID-signed. */
export function createWebPushTransport(
  vapidDetails: VapidDetails,
  sendNotification: typeof webPush.sendNotification = webPush.sendNotification,
): Transport {
  return {
    async send(subscription, payload) {
      try {
        // Scheduled reminders are time-sensitive: `high` asks for immediate delivery.
        await sendNotification(subscription, payload, {
          vapidDetails,
          TTL: TTL_SECONDS,
          urgency: 'high',
          timeout: TIMEOUT_MS,
        })
        return { status: 'sent' }
      } catch (error) {
        if (error instanceof webPush.WebPushError) {
          if (error.statusCode === 404 || error.statusCode === 410) return { status: 'gone' }
          return { status: 'failed', reason: `push service answered ${error.statusCode}` }
        }
        return { status: 'failed', reason: String(error) }
      }
    },
  }
}
