import { type Context, Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'
import { bodyLimit } from 'hono/body-limit'
import type { Sender, SendNowResult } from './sender.ts'
import { parseNotification, parseSchedule, parseSubscription } from './validation.ts'

const MAX_BODY_BYTES = 512 * 1024

const SEND_NOW_STATUS = {
  sent: 204,
  'no-subscription': 409,
  gone: 410,
  failed: 502,
} as const satisfies Record<SendNowResult, number>

/** The parsed JSON body, or undefined when it is missing or not JSON. */
const readJson = (c: Context): Promise<unknown> => c.req.json().catch(() => undefined)

/**
 * The contract with the app: register or replace the subscription, replace the whole
 * schedule, send a test push now. Every route, unknown ones included, requires the shared
 * secret as a bearer token; a rejected request never reaches the sender.
 */
export function createApp({ sender, sharedSecret }: { sender: Sender; sharedSecret: string }) {
  const app = new Hono()

  app.use(bearerAuth({ token: sharedSecret }))
  app.use(bodyLimit({ maxSize: MAX_BODY_BYTES }))

  app.put('/subscription', async (c) => {
    const subscription = parseSubscription(await readJson(c))
    if (!subscription) return c.json({ error: 'invalid subscription' }, 400)
    await sender.registerSubscription(subscription)
    return c.body(null, 204)
  })

  app.put('/schedule', async (c) => {
    const schedule = parseSchedule(await readJson(c))
    if (!schedule) return c.json({ error: 'invalid schedule' }, 400)
    await sender.replaceSchedule(schedule)
    return c.body(null, 204)
  })

  app.post('/test', async (c) => {
    const notification = parseNotification(await readJson(c))
    if (!notification) return c.json({ error: 'invalid notification' }, 400)
    const result = await sender.sendNow(notification)
    return c.body(null, SEND_NOW_STATUS[result])
  })

  return app
}
