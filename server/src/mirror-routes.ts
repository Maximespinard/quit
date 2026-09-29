import { factIdSchema, factSchema } from '@quit/contract/facts'
import { settingsSchema } from '@quit/contract/settings'
import { Router } from 'express'
import type * as z from 'zod/mini'
import type { Db } from './database.ts'
import { deleteFact, putFact, putSettings, readMirror } from './mirror.ts'
import { sendProblem } from './problem.ts'

/**
 * What a body that fails its schema gets told: the fields at fault, as dotted paths
 * (`protocol.0.durationDays`), or what the body should have been when it is not even that.
 */
function invalidBodyDetail(expected: string, issues: readonly z.core.$ZodIssue[]) {
  const fields = [...new Set(issues.map((issue) => issue.path.map(String).join('.')))]
  if (fields.includes('')) return `The body is not ${expected}.`
  return `Invalid ${fields.length === 1 ? 'field' : 'fields'}: ${fields.join(', ')}.`
}

const INVALID_PATH_ID = 'Invalid path id: a fact id is a UUIDv7.'

/**
 * The fact id in the path, in lower case: a UUID's hex digits read the same in either case, and
 * one fact must stay one row.
 */
const parsePathId = (id: string) => factIdSchema.safeParse(id.toLowerCase())

/**
 * The mirror's routes (ADR-0003), behind the device key. Bodies are checked against the
 * contract's schemas, for shape only: a domain rule is the app's business, never the server's.
 */
export function mirrorRoutes({ db, now }: { db: Db; now: () => Date }) {
  const router = Router()

  router.put('/api/facts/:id', (req, res) => {
    const id = parsePathId(req.params.id)
    if (!id.success) return sendProblem(res, 400, INVALID_PATH_ID)
    const fact = factSchema.safeParse(req.body)
    if (!fact.success) return sendProblem(res, 400, invalidBodyDetail('a fact', fact.error.issues))
    if (fact.data.id !== undefined && fact.data.id.toLowerCase() !== id.data) {
      return sendProblem(res, 400, 'Invalid field: id, it differs from the path id.')
    }
    putFact(db, id.data, fact.data, now())
    res.status(204).end()
  })

  router.delete('/api/facts/:id', (req, res) => {
    const id = parsePathId(req.params.id)
    if (!id.success) return sendProblem(res, 400, INVALID_PATH_ID)
    deleteFact(db, id.data)
    res.status(204).end()
  })

  router.put('/api/settings', (req, res) => {
    const next = settingsSchema.safeParse(req.body)
    if (!next.success) {
      return sendProblem(res, 400, invalidBodyDetail('the settings', next.error.issues))
    }
    putSettings(db, next.data, now())
    res.status(204).end()
  })

  router.get('/api/mirror', (_req, res) => {
    res.json(readMirror(db))
  })

  return router
}
