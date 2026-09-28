import { derive } from './derive'
import { emptyJournal, type Journal } from './journal'
import { exportJournal, importJournal } from './journal-file'
import { scenarios } from './scenarios'

const HOUR = 60 * 60_000
const DAY = 24 * HOUR
const NOW = Date.UTC(2026, 8, 28, 10, 0, 0)
const QUIT = NOW - 10 * DAY

const journal: Journal = {
  facts: [
    { type: 'quit-moment', at: QUIT },
    { type: 'patch-application', at: QUIT + HOUR, doseMg: 21 },
    {
      type: 'craving',
      at: QUIT + 2 * DAY,
      intensity: 3,
      heldToEnd: true,
      tags: ['coffee', 'Yoga'],
    },
    { type: 'lapse', at: QUIT + 4 * DAY, count: 2 },
  ],
  protocol: [
    { doseMg: 21, durationDays: 30, brand: 'Nicopatch' },
    { doseMg: 10.5, durationDays: 14 },
  ],
  weeklySpendCents: 4890,
  baselineSmokesPerDay: 18,
}

/** An export of `journal` as parsed JSON, to be altered before it is imported back. */
const exported = () => JSON.parse(exportJournal(journal, NOW)) as Record<string, unknown>

const withJournal = (changes: Record<string, unknown>) =>
  JSON.stringify({ ...exported(), journal: { ...journal, ...changes } })

const withFacts = (...facts: readonly unknown[]) => withJournal({ facts })

describe('exportJournal', () => {
  it('writes one versioned file holding every fact and every setting, money in integer cents', () => {
    expect(JSON.parse(exportJournal(journal, NOW))).toEqual({
      format: 'quit-journal',
      version: 1,
      exportedAt: NOW,
      journal: {
        facts: journal.facts,
        protocol: journal.protocol,
        weeklySpendCents: 4890,
        baselineSmokesPerDay: 18,
      },
    })
  })

  it('writes facts and settings only, never a derived value', () => {
    const { journal: written } = exported() as { journal: Record<string, unknown> }

    expect(Object.keys(written).sort()).toEqual([
      'baselineSmokesPerDay',
      'facts',
      'protocol',
      'weeklySpendCents',
    ])
  })
})

describe('importJournal', () => {
  it('reads an export back into the journal it was made from', () => {
    expect(importJournal(exportJournal(journal, NOW))).toEqual({
      ok: true,
      journal,
      exportedAt: NOW,
    })
  })

  it.each(scenarios.map((scenario) => [scenario.id, scenario] as const))(
    'derives every figure of %s exactly as the exporting device did',
    (_id, scenario) => {
      const imported = importJournal(exportJournal(scenario.journal, scenario.now))

      expect(imported.ok && derive(imported.journal, scenario.now)).toEqual(
        derive(scenario.journal, scenario.now),
      )
    },
  )

  it('reads a journal whose spend and baseline were never set', () => {
    const unset: Journal = { ...journal, weeklySpendCents: null, baselineSmokesPerDay: null }

    expect(importJournal(exportJournal(unset, NOW))).toMatchObject({ ok: true, journal: unset })
  })

  it('reads a craving from before the quit moment, as recording allows it', () => {
    const early = { type: 'craving', at: QUIT - DAY, intensity: 1, heldToEnd: false, tags: [] }

    expect(importJournal(withFacts(...journal.facts, early)).ok).toBe(true)
  })

  it.each([
    ['empty', ''],
    ['not JSON', 'quit'],
    ['truncated', exportJournal(journal, NOW).slice(0, -12)],
  ])('refuses a file that is %s as unreadable', (_case, text) => {
    expect(importJournal(text)).toEqual({ ok: false, reason: 'unreadable' })
  })

  it.each([
    ['a JSON list', '[]'],
    ['JSON null', 'null'],
    ['another format', JSON.stringify({ ...exported(), format: 'other-app' })],
    ['a file without a journal', JSON.stringify({ ...exported(), journal: undefined })],
    ['a file without an export time', JSON.stringify({ ...exported(), exportedAt: 'today' })],
    ['a bare journal', JSON.stringify(journal)],
  ])('refuses %s as not an export', (_case, text) => {
    expect(importJournal(text)).toEqual({ ok: false, reason: 'not-an-export' })
  })

  it.each([
    ['a later version', 2],
    ['version zero', 0],
    ['no version', undefined],
    ['a version as text', '1'],
  ])('refuses %s', (_case, version) => {
    expect(importJournal(JSON.stringify({ ...exported(), version }))).toEqual({
      ok: false,
      reason: 'unsupported-version',
    })
  })

  it('refuses a fact type this version does not know, whatever else the file holds', () => {
    const checkIn = { type: 'mood-check', at: QUIT + DAY, mood: 4 }

    expect(importJournal(withFacts(...journal.facts, checkIn))).toEqual({
      ok: false,
      reason: 'unknown-fact-type',
    })
  })

  it.each([
    ['a craving rated 4', { type: 'craving', at: QUIT, intensity: 4, heldToEnd: true, tags: [] }],
    ['a patch application without a dose', { type: 'patch-application', at: QUIT }],
    ['a lapse of half a cigarette', { type: 'lapse', at: QUIT + DAY, count: 0.5 }],
    ['a quit moment without a time', { type: 'quit-moment' }],
    ['a fact that is not an object', 'lapse'],
  ])('refuses %s instead of dropping it', (_case, fact) => {
    expect(importJournal(withFacts(...journal.facts, fact))).toEqual({
      ok: false,
      reason: 'invalid-fact',
    })
  })

  it('refuses facts that are not a list', () => {
    expect(importJournal(withJournal({ facts: {} }))).toEqual({ ok: false, reason: 'invalid-fact' })
  })

  it.each([
    ['a lapse', { type: 'lapse', at: QUIT - HOUR, count: 1 }],
    ['a patch application', { type: 'patch-application', at: QUIT - HOUR, doseMg: 21 }],
  ])('refuses %s before the quit moment', (_case, fact) => {
    expect(importJournal(withFacts(...journal.facts, fact))).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('checks facts against the quit moment in force, the latest one recorded', () => {
    const corrected = { type: 'quit-moment', at: QUIT + 2 * HOUR }

    expect(importJournal(withFacts(...journal.facts, corrected))).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a journal without a quit moment: there is no journey to restore', () => {
    expect(importJournal(exportJournal(emptyJournal, NOW))).toEqual({
      ok: false,
      reason: 'no-quit-moment',
    })
  })

  it.each([
    ['a weekly spend in euros', { weeklySpendCents: 48.9 }],
    ['a missing weekly spend', { weeklySpendCents: undefined }],
    ['a baseline of zero', { baselineSmokesPerDay: 0 }],
    ['an empty protocol', { protocol: [] }],
    ['a step without a duration', { protocol: [{ doseMg: 21 }] }],
    ['a protocol that is not a list', { protocol: 'default' }],
  ])('refuses %s instead of replacing it with a default', (_case, changes) => {
    expect(importJournal(withJournal(changes))).toEqual({ ok: false, reason: 'invalid-settings' })
  })
})
