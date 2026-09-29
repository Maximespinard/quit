import { describe, expect, it } from 'vitest'
import { journalFileSchema } from './journal-file.ts'

const AT = Date.UTC(2026, 8, 29, 10, 0, 0)

const file = {
  format: 'quit-journal',
  version: 1,
  exportedAt: AT,
  origin: 'device',
  journal: {
    facts: [
      { type: 'quit-moment', at: AT - 1_000 },
      { type: 'lapse', at: AT, count: 1 },
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

  it.each([
    ['another format', { format: 'other-app' }],
    ['a later version', { version: 2 }],
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
