import {
  pushNotificationSchema,
  pushScheduleSchema,
  pushSubscriptionSchema,
} from '@quit/contract/push'
import { Router } from 'express'
import { sendProblem } from '../problem.ts'
import type { PushSender, SendNowResult } from './push-sender.ts'

/** How a test push that did not go out is answered. */
const TEST_PUSH_PROBLEMS = {
  'no-subscription': [409, 'No push subscription is registered.'],
  gone: [410, 'The push subscription is gone: register a new one.'],
  failed: [502, 'The push service did not accept the notification.'],
} as const satisfies Record<Exclude<SendNowResult, 'sent'>, readonly [number, string]>

/**
 * The push contract with the app, mounted under `/api/push` behind the device key: register or
 * replace the subscription, replace the whole schedule, send a test push now. Both `PUT`s
 * replace what was there and are idempotent.
 */
export function createPushRoutes(sender: PushSender) {
  const router = Router()

  router.put('/subscription', (req, res) => {
    const subscription = pushSubscriptionSchema.safeParse(req.body)
    if (!subscription.success) return sendProblem(res, 400, 'The push subscription is invalid.')
    sender.registerSubscription(subscription.data)
    res.sendStatus(204)
  })

  router.put('/schedule', (req, res) => {
    const schedule = pushScheduleSchema.safeParse(req.body)
    if (!schedule.success) return sendProblem(res, 400, 'The push schedule is invalid.')
    sender.replaceSchedule(schedule.data.notifications)
    res.sendStatus(204)
  })

  router.post('/test', async (req, res) => {
    const notification = pushNotificationSchema.safeParse(req.body)
    if (!notification.success) return sendProblem(res, 400, 'The notification is invalid.')
    const result = await sender.sendNow(notification.data)
    if (result === 'sent') return void res.sendStatus(204)
    const [status, detail] = TEST_PUSH_PROBLEMS[result]
    sendProblem(res, status, detail)
  })

  return router
}
