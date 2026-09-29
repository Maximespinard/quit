import { describe, expect, it } from 'vitest'
import { journalFileSchema } from './journal-file.ts'

const AT = Date.UTC(2026, 8, 29, 10, 0, 0)

const file = {
  format: 'quit-journal',
  version: 2,
  exportedAt: AT,
  origin: 'device',
  journal: {
    facts: [
      { type: 'quit-moment', id: '0199a6f2-4c00-7abc-8def-0123456789ab', at: AT - 1_000 },
      { type: 'lapse', id: '0199a6f2-4c01-7abc-8def-0123456789ab', at: AT, count: 1 },
    ],
    protocol: [{ doseMg: 21, durationDays: 28 }],
    weeklySpendCents: 4_890,
    baselineSmokesPerDay: 18,
    goal: null,
  },
}

describe('journalFileSchema', () => {
  it('reads an export file as it was written', () => {
    expect(journalFileSchema.parse(file)).toEqual(file)
  })

  it('reads a version 1 file, written before facts had an id', () => {
    const facts = [{ type: 'quit-moment', at: AT - 1_000 }]
    const v1 = { ...file, version: 1, journal: { ...file.journal, facts } }

    expect(journalFileSchema.parse(v1)).toEqual(v1)
  })

  it.each([
    ['another format', { format: 'other-app' }],
    ['a later version', { version: 3 }],
    ['an unknown origin', { origin: 'server' }],
    ['no export time', { exportedAt: undefined }],
    ['no journal', { journal: undefined }],
  ])('refuses %s', (_case, changes) => {
    expect(journalFileSchema.safeParse({ ...file, ...changes }).success).toBe(false)
  })

  it('refuses the whole file for one malformed fact', () => {
    const journal = { ...file.journal, facts: [...file.journal.facts, { type: 'lapse' }] }

    expect(journalFileSchema.safeParse({ ...file, journal }).success).toBe(false)
  })
})
