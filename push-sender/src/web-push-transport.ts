import webPush from 'web-push'
import type { Transport } from './types.ts'

export interface VapidDetails {
  /** `mailto:` or `https:` URL: Apple rejects any other JWT subject (`BadJwtToken`). */
  subject: string
  publicKey: string
  privateKey: string
}

/** How long the push service keeps a notification for an offline device, in seconds. */
const TTL_SECONDS = 60 * 60

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
