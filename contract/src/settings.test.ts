import { describe, expect, it } from 'vitest'
import { goalSchema, settingsSchema, stepSchema } from './settings.ts'

const settings = {
  protocol: [
    { doseMg: 21, durationDays: 28, brand: 'Nicopatch' },
    { doseMg: 10.5, durationDays: 14 },
  ],
  weeklySpendCents: 4_890,
  baselineSmokesPerDay: 18,
  goal: { label: 'Vélo', priceCents: 45_000, countsFrom: null, celebrated: true },
}

describe('settingsSchema', () => {
  it('reads every setting as it was written, money in integer cents', () => {
    expect(settingsSchema.parse(settings)).toEqual(settings)
  })

  it('reads settings not set yet as null, and a missing goal as no goal', () => {
    const unset = { ...settings, weeklySpendCents: null, baselineSmokesPerDay: null }

    expect(settingsSchema.parse({ ...unset, goal: undefined })).toEqual({ ...unset, goal: null })
  })

  it.each([
    ['a weekly spend in euros', { weeklySpendCents: 48.9 }],
    ['a missing weekly spend', { weeklySpendCents: undefined }],
    ['a baseline of zero', { baselineSmokesPerDay: 0 }],
    ['an empty protocol', { protocol: [] }],
    ['a step without a duration', { protocol: [{ doseMg: 21 }] }],
    ['a step of half a day', { protocol: [{ doseMg: 21, durationDays: 0.5 }] }],
    ['a dose as text', { protocol: [{ doseMg: '21', durationDays: 28 }] }],
    ['a protocol that is not a list', { protocol: 'default' }],
  ])('refuses %s', (_case, changes) => {
    expect(settingsSchema.safeParse({ ...settings, ...changes }).success).toBe(false)
  })
})

describe('stepSchema', () => {
  it('reads a brand trimmed', () => {
    expect(stepSchema.parse({ doseMg: 21, durationDays: 28, brand: '  Nicopatch ' })).toEqual({
      doseMg: 21,
      durationDays: 28,
      brand: 'Nicopatch',
    })
  })

  it.each([
    ['blank', '   '],
    ['not text', 21],
    ['null', null],
    ['undefined', undefined],
  ])('reads a step whose brand is %s as one without a brand, the step kept', (_case, brand) => {
    expect(stepSchema.parse({ doseMg: 21, durationDays: 28, brand }).brand).toBeUndefined()
  })
})

describe('goalSchema', () => {
  it('reads a goal stored before its start and celebration existed as counting from the quit moment, not seen', () => {
    expect(goalSchema.parse({ label: 'Vélo', priceCents: 45_000 })).toEqual({
      label: 'Vélo',
      priceCents: 45_000,
      countsFrom: null,
      celebrated: false,
    })
  })

  it('reads the label trimmed', () => {
    expect(goalSchema.parse({ ...settings.goal, label: '  Vélo ' }).label).toBe('Vélo')
  })

  it.each([
    ['without a label', { label: undefined }],
    ['with a blank label', { label: '   ' }],
    ['with a label over 60 characters', { label: 'v'.repeat(61) }],
    ['priced in euros', { priceCents: 450.5 }],
    ['counting from nowhere', { countsFrom: 'x' }],
  ])('refuses a goal %s', (_case, changes) => {
    expect(goalSchema.safeParse({ ...settings.goal, ...changes }).success).toBe(false)
  })
})
