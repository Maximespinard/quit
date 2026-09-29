import { describe, expect, it } from 'vitest'
import { factSchema } from './facts.ts'

const AT = Date.UTC(2026, 8, 29, 10, 0, 0)
const ID = '0199a6f2-4c00-7abc-8def-0123456789ab'

describe('factSchema', () => {
  it.each([
    ['a quit moment', { type: 'quit-moment', at: AT }],
    ['a craving', { type: 'craving', at: AT, intensity: 3, heldToEnd: true, tags: ['coffee'] }],
    ['a patch application', { type: 'patch-application', at: AT, doseMg: 10.5 }],
    [
      'a patch application with its site',
      { type: 'patch-application', at: AT, doseMg: 21, site: 'hip-left' },
    ],
    ['a lapse', { type: 'lapse', at: AT, count: 3 }],
    ['a fact with its id', { type: 'lapse', id: ID, at: AT, count: 1 }],
  ])('reads %s as it was written', (_case, fact) => {
    expect(factSchema.parse(fact)).toEqual(fact)
  })

  it('reads a lapse written before it had a count as one cigarette', () => {
    expect(factSchema.parse({ type: 'lapse', at: AT })).toEqual({ type: 'lapse', at: AT, count: 1 })
  })

  it('reads a craving written before tags existed as one without tags', () => {
    expect(factSchema.parse({ type: 'craving', at: AT, intensity: 1, heldToEnd: false })).toEqual({
      type: 'craving',
      at: AT,
      intensity: 1,
      heldToEnd: false,
      tags: [],
    })
  })

  it('reads a patch application whose site is left undefined as one without a site', () => {
    const fact = factSchema.parse({
      type: 'patch-application',
      at: AT,
      doseMg: 21,
      site: undefined,
    })

    expect(fact).toEqual({ type: 'patch-application', at: AT, doseMg: 21 })
  })

  it('keeps no key the schema does not know', () => {
    expect(factSchema.parse({ type: 'quit-moment', at: AT, streak: 12 })).toEqual({
      type: 'quit-moment',
      at: AT,
    })
  })

  it.each([
    ['a fact of an unknown type', { type: 'mood-check', at: AT }],
    ['a fact without a type', { at: AT }],
    ['a time that is not a number', { type: 'quit-moment', at: 'yesterday' }],
    ['a time that is not finite', { type: 'quit-moment', at: Number.POSITIVE_INFINITY }],
    ['a craving rated 4', { type: 'craving', at: AT, intensity: 4, heldToEnd: true, tags: [] }],
    ['a craving without its held mark', { type: 'craving', at: AT, intensity: 2, tags: [] }],
    [
      'tags that are not words',
      { type: 'craving', at: AT, intensity: 2, heldToEnd: true, tags: [3] },
    ],
    ['a patch application without a dose', { type: 'patch-application', at: AT }],
    ['a dose of zero', { type: 'patch-application', at: AT, doseMg: 0 }],
    ['an unknown site', { type: 'patch-application', at: AT, doseMg: 21, site: 'knee' }],
    ['a site set to null', { type: 'patch-application', at: AT, doseMg: 21, site: null }],
    ['a lapse of half a cigarette', { type: 'lapse', at: AT, count: 0.5 }],
    ['a lapse of no cigarette', { type: 'lapse', at: AT, count: 0 }],
    ['a value that is not an object', 'lapse'],
    ['an id that is not a UUID', { type: 'lapse', id: 'fact-1', at: AT, count: 1 }],
    [
      'an id that is a UUID of another version',
      { type: 'lapse', id: '0199a6f2-4c00-4abc-8def-0123456789ab', at: AT, count: 1 },
    ],
  ])('refuses %s', (_case, fact) => {
    expect(factSchema.safeParse(fact).success).toBe(false)
  })
})
