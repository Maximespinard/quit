import type { Fact } from '@quit/contract/facts'
import { type Mirror, mirrorSchema } from '@quit/contract/mirror'
import type { Settings } from '@quit/contract/settings'
import { describe, expect, it } from 'vitest'
import { cravingTags, facts, protocolSteps } from './schema.ts'
import { expectProblem, factId, setup, T0 } from './test-api.ts'

const QUIT_AT = Date.parse('2026-09-01T07:30:00Z')
const HOUR_MS = 3_600_000

const quitMoment: Fact = { type: 'quit-moment', id: factId(1), at: QUIT_AT }
const craving: Fact = {
  type: 'craving',
  id: factId(2),
  at: QUIT_AT + 5 * HOUR_MS,
  intensity: 3,
  heldToEnd: true,
  tags: ['after-meal', 'coffee', 'mes propres mots'],
}
const patch: Fact = {
  type: 'patch-application',
  id: factId(3),
  at: QUIT_AT + HOUR_MS,
  doseMg: 10.5,
  site: 'arm-left',
}
const patchWithoutSite: Fact = {
  type: 'patch-application',
  id: factId(4),
  at: QUIT_AT + 25 * HOUR_MS,
  doseMg: 21,
}
const lapse: Fact = { type: 'lapse', id: factId(5), at: QUIT_AT + 30 * HOUR_MS, count: 2 }

const settings: Settings = {
  protocol: [
    { doseMg: 21, durationDays: 28, brand: 'Nicopatch' },
    { doseMg: 14, durationDays: 21 },
    { doseMg: 7, durationDays: 14 },
  ],
  weeklySpendCents: 8400,
  baselineSmokesPerDay: 15,
  goal: { label: 'Vélo', priceCents: 64900, countsFrom: null, celebrated: false },
}

async function linkedApi(options: Parameters<typeof setup>[0] = {}) {
  const api = await setup(options)
  const key = api.issueKey()
  const send = (method: string, path: string, body?: unknown) =>
    api.request(method, path, {
      key,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  return {
    ...api,
    putFact: (fact: Fact, id = fact.id) => send('PUT', `/api/facts/${id}`, fact),
    deleteFact: (id: string) => send('DELETE', `/api/facts/${id}`),
    putSettings: (body: unknown) => send('PUT', '/api/settings', body),
    putRaw: (path: string, body: unknown) => send('PUT', path, body),
    async readMirror(): Promise<Mirror> {
      const response = await send('GET', '/api/mirror')
      expect(response.status).toBe(200)
      return mirrorSchema.parse(await response.json())
    },
  }
}

describe('facts', () => {
  it.each([
    ['a quit moment', quitMoment],
    ['a craving, its tags in order', craving],
    ['a patch application', patch],
    ['a patch application without a site', patchWithoutSite],
    ['a lapse', lapse],
  ])('round-trips %s unchanged', async (_, fact) => {
    const api = await linkedApi()

    const response = await api.putFact(fact)

    expect(response.status).toBe(204)
    expect(await api.readMirror()).toEqual({ facts: [fact], settings: null })
  })

  it('replaces a fact put twice: one row, the latest content, first received time kept', async () => {
    let now = T0
    const api = await linkedApi({ now: () => now })
    const corrected: Fact = { ...craving, intensity: 1, heldToEnd: false, tags: ['stress'] }

    await api.putFact(craving)
    now = new Date(T0.getTime() + HOUR_MS)
    const response = await api.putFact(corrected)

    expect(response.status).toBe(204)
    expect((await api.readMirror()).facts).toEqual([corrected])
    const rows = api.database.db.select().from(facts).all()
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ receivedAt: T0, updatedAt: now })
    expect(api.database.db.select().from(cravingTags).all()).toHaveLength(1)
  })

  it('is idempotent: the same PUT replayed leaves one fact', async () => {
    const api = await linkedApi()

    await api.putFact(lapse)
    await api.putFact(lapse)

    expect((await api.readMirror()).facts).toEqual([lapse])
  })

  it('lets a correction change the type of a fact: no column of the old type is left', async () => {
    const api = await linkedApi()
    const asLapse: Fact = { type: 'lapse', id: craving.id, at: craving.at, count: 1 }

    await api.putFact(craving)
    await api.putFact(asLapse)

    expect((await api.readMirror()).facts).toEqual([asLapse])
    expect(api.database.db.select().from(cravingTags).all()).toEqual([])
  })

  it('answers the facts ordered by time, whatever order they were put in', async () => {
    const api = await linkedApi()

    for (const fact of [lapse, craving, quitMoment, patchWithoutSite, patch]) {
      await api.putFact(fact)
    }

    expect((await api.readMirror()).facts).toEqual([
      quitMoment,
      patch,
      craving,
      patchWithoutSite,
      lapse,
    ])
  })

  it('reads an id in capitals as the same id: one fact, stored in lower case', async () => {
    const api = await linkedApi()
    const fact: Fact = { ...quitMoment, id: '019a3f2c-7b1e-7d4a-9c3b-5e6f7a8b9cde' }
    const upper = (fact.id ?? '').toUpperCase()

    await api.putFact(fact)
    const response = await api.putRaw(`/api/facts/${upper}`, { ...fact, id: upper })
    const deleted = await api.deleteFact(upper)

    expect(response.status).toBe(204)
    expect(deleted.status).toBe(204)
    expect((await api.readMirror()).facts).toEqual([])
  })

  it('stores a fact sent without an id under the path id', async () => {
    const api = await linkedApi()
    const { id: _, ...withoutId } = quitMoment

    const response = await api.putRaw(`/api/facts/${factId(9)}`, withoutId)

    expect(response.status).toBe(204)
    expect((await api.readMirror()).facts).toEqual([{ ...quitMoment, id: factId(9) }])
  })

  it('reads the contract defaults: a lapse without a count is one cigarette', async () => {
    const api = await linkedApi()

    await api.putRaw(`/api/facts/${lapse.id}`, { type: 'lapse', id: lapse.id, at: lapse.at })

    expect((await api.readMirror()).facts).toEqual([{ ...lapse, count: 1 }])
  })

  it('accepts a lapse before the quit moment: the server checks shape, never domain rules', async () => {
    const api = await linkedApi()
    const lapseBefore: Fact = { type: 'lapse', id: factId(6), at: QUIT_AT - HOUR_MS, count: 1 }

    await api.putFact(quitMoment)
    const response = await api.putFact(lapseBefore)

    expect(response.status).toBe(204)
    expect((await api.readMirror()).facts).toEqual([lapseBefore, quitMoment])
  })

  it('deletes a fact, its tags with it', async () => {
    const api = await linkedApi()
    await api.putFact(craving)
    await api.putFact(lapse)

    const response = await api.deleteFact(craving.id ?? '')

    expect(response.status).toBe(204)
    expect((await api.readMirror()).facts).toEqual([lapse])
    expect(api.database.db.select().from(cravingTags).all()).toEqual([])
  })

  it('answers 204 to the DELETE of a fact already absent', async () => {
    const api = await linkedApi()

    const response = await api.deleteFact(factId(42))

    expect(response.status).toBe(204)
  })
})

describe('fact validation', () => {
  it.each([
    ['an intensity out of range', { ...craving, intensity: 4 }, ['intensity']],
    [
      'two invalid fields',
      { ...craving, intensity: 0, heldToEnd: 'yes' },
      ['intensity', 'heldToEnd'],
    ],
    ['an unknown type', { type: 'mood', id: factId(2), at: QUIT_AT }, ['type']],
    ['a zero dose', { ...patch, doseMg: 0 }, ['doseMg']],
    ['an unknown site', { ...patch, site: 'knee' }, ['site']],
    ['a fractional count', { ...lapse, count: 1.5 }, ['count']],
    ['a tag that is not text', { ...craving, tags: ['coffee', 7] }, ['tags.1']],
    ['a missing time', { type: 'quit-moment', id: factId(1) }, ['at']],
  ])('answers 400 naming the field for %s', async (_, body, fields) => {
    const api = await linkedApi()

    const response = await api.putRaw(`/api/facts/${body.id}`, body)

    const problem = await expectProblem(response, 400)
    for (const field of fields) expect(problem.detail).toContain(field)
    expect(api.database.db.select().from(facts).all()).toEqual([])
  })

  it('answers 400 to a body that is not a fact at all', async () => {
    const api = await linkedApi()

    const response = await api.putRaw(`/api/facts/${factId(1)}`, [quitMoment])

    const problem = await expectProblem(response, 400)
    expect(problem.detail).toContain('fact')
  })

  it('answers 400 naming the id when the body id differs from the path id', async () => {
    const api = await linkedApi()

    const response = await api.putRaw(`/api/facts/${factId(8)}`, quitMoment)

    const problem = await expectProblem(response, 400)
    expect(problem.detail).toContain('id')
    expect((await api.readMirror()).facts).toEqual([])
  })

  it.each([
    ['not a UUID', 'craving-1'],
    ['a UUID of another version', '0f8fad5b-d9cb-469f-a165-70867728950e'],
  ])('answers 400 to a path id that is %s', async (_, id) => {
    const api = await linkedApi()

    const put = await api.putFact({ ...quitMoment, id: factId(1) }, id)
    const deleted = await api.deleteFact(id)

    expect((await expectProblem(put, 400)).detail).toContain('id')
    expect((await expectProblem(deleted, 400)).detail).toContain('id')
  })
})

describe('settings', () => {
  it('round-trips, protocol step order, brand and goal included', async () => {
    const api = await linkedApi()

    const response = await api.putSettings(settings)

    expect(response.status).toBe(204)
    expect(await api.readMirror()).toEqual({ facts: [], settings })
  })

  it('replaces the whole settings: steps and goal from the previous PUT are gone', async () => {
    const api = await linkedApi()
    const next: Settings = {
      protocol: [{ doseMg: 7, durationDays: 10, brand: 'Niquitin' }],
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
    }

    await api.putSettings(settings)
    await api.putSettings(next)

    expect((await api.readMirror()).settings).toEqual(next)
    expect(api.database.db.select().from(protocolSteps).all()).toHaveLength(1)
  })

  it('keeps a reached goal: where its money starts counting and its celebration', async () => {
    const api = await linkedApi()
    const withReachedGoal: Settings = {
      ...settings,
      goal: {
        label: 'Voyage',
        priceCents: 120000,
        countsFrom: QUIT_AT + 40 * HOUR_MS,
        celebrated: true,
      },
    }

    await api.putSettings(withReachedGoal)

    expect((await api.readMirror()).settings).toEqual(withReachedGoal)
  })

  it('reads the contract defaults: a settings body without a goal has none', async () => {
    const api = await linkedApi()
    const { goal: _, ...withoutGoal } = settings

    await api.putSettings(withoutGoal)

    expect((await api.readMirror()).settings).toEqual({ ...settings, goal: null })
  })

  it.each([
    ['an empty protocol', { ...settings, protocol: [] }, ['protocol']],
    [
      'a fractional step duration',
      { ...settings, protocol: [{ doseMg: 21, durationDays: 1.5 }] },
      ['protocol.0.durationDays'],
    ],
    ['a spend in euros, not cents', { ...settings, weeklySpendCents: 84.5 }, ['weeklySpendCents']],
    [
      'a goal without a price',
      { ...settings, goal: { label: 'Vélo', countsFrom: null, celebrated: false } },
      ['goal.priceCents'],
    ],
  ])('answers 400 naming the field for %s', async (_, body, fields) => {
    const api = await linkedApi()
    await api.putSettings(settings)

    const response = await api.putSettings(body)

    const problem = await expectProblem(response, 400)
    for (const field of fields) expect(problem.detail).toContain(field)
    expect((await api.readMirror()).settings).toEqual(settings)
  })
})

describe('mirror', () => {
  it('answers an empty mirror before anything was sent', async () => {
    const api = await linkedApi()

    expect(await api.readMirror()).toEqual({ facts: [], settings: null })
  })

  it('answers the facts and the settings together', async () => {
    const api = await linkedApi()

    await api.putSettings(settings)
    await api.putFact(craving)
    await api.putFact(quitMoment)

    expect(await api.readMirror()).toEqual({ facts: [quitMoment, craving], settings })
  })
})

describe('device key', () => {
  it.each([
    ['PUT', `/api/facts/${factId(1)}`],
    ['DELETE', `/api/facts/${factId(1)}`],
    ['PUT', '/api/settings'],
    ['GET', '/api/mirror'],
  ])('answers 401 to %s %s without the device key', async (method, path) => {
    const api = await setup()
    api.issueKey()

    const response = await api.request(method, path, {
      ...(method === 'PUT' ? { body: JSON.stringify(quitMoment) } : {}),
    })

    await expectProblem(response, 401)
  })
})
