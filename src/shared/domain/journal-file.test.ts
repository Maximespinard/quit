import { factIdSequence } from '@/shared/test/fact-ids'
import { factId } from '@/shared/utils/fact-id'
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
    { type: 'quit-moment', id: factId(1), at: QUIT },
    { type: 'patch-application', id: factId(2), at: QUIT + HOUR, doseMg: 21, site: 'arm-left' },
    {
      type: 'craving',
      id: factId(3),
      at: QUIT + 2 * DAY,
      intensity: 3,
      heldToEnd: true,
      tags: ['coffee', 'Yoga'],
    },
    { type: 'lapse', id: factId(4), at: QUIT + 4 * DAY, count: 2 },
  ],
  protocol: [
    { doseMg: 21, durationDays: 30, brand: 'Nicopatch' },
    { doseMg: 10.5, durationDays: 14 },
  ],
  weeklySpendCents: 4890,
  baselineSmokesPerDay: 18,
  goal: { label: 'Vélo', priceCents: 45_000, countsFrom: QUIT + 3 * DAY, celebrated: false },
}

/** An export of `journal` as parsed JSON, to be altered before it is imported back. */
const exported = () => JSON.parse(exportJournal(journal, NOW, 'device')) as Record<string, unknown>

const withJournal = (changes: Record<string, unknown>) =>
  JSON.stringify({ ...exported(), journal: { ...journal, ...changes } })

const withFacts = (...facts: readonly unknown[]) => withJournal({ facts })

describe('exportJournal', () => {
  it('writes one version 2 file holding every fact with its id and every setting, money in integer cents', () => {
    expect(JSON.parse(exportJournal(journal, NOW, 'device'))).toEqual({
      format: 'quit-journal',
      version: 2,
      exportedAt: NOW,
      origin: 'device',
      journal: {
        facts: journal.facts,
        protocol: journal.protocol,
        weeklySpendCents: 4890,
        baselineSmokesPerDay: 18,
        goal: journal.goal,
      },
    })
  })

  it('writes facts and settings only, never a derived value', () => {
    const { journal: written } = exported() as { journal: Record<string, unknown> }

    expect(Object.keys(written).sort()).toEqual([
      'baselineSmokesPerDay',
      'facts',
      'goal',
      'protocol',
      'weeklySpendCents',
    ])
  })
})

describe('importJournal, from the sandbox', () => {
  const sandboxFile = exportJournal(journal, NOW, 'sandbox')

  it('refuses a sandbox export over the real journal', () => {
    expect(importJournal(sandboxFile, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'sandbox-file',
    })
  })

  it('lets the sandbox read its own exports and the real ones', () => {
    expect(importJournal(sandboxFile, 'sandbox', factIdSequence()).ok).toBe(true)
    expect(
      importJournal(exportJournal(journal, NOW, 'device'), 'sandbox', factIdSequence()).ok,
    ).toBe(true)
  })

  it('refuses a file that does not say where it comes from', () => {
    const text = JSON.stringify({ ...JSON.parse(sandboxFile), origin: undefined })

    expect(importJournal(text, 'sandbox', factIdSequence())).toEqual({
      ok: false,
      reason: 'not-an-export',
    })
  })
})

describe('importJournal', () => {
  /** `journal` as a version 1 file wrote it, before facts had an id. */
  const v1Facts = journal.facts.map(({ id: _id, ...fact }) => fact)
  const v1File = JSON.stringify({
    ...exported(),
    version: 1,
    journal: { ...journal, facts: v1Facts },
  })

  it('reads a version 1 file, exported before facts had an id: its facts get theirs, in order', () => {
    expect(importJournal(v1File, 'device', factIdSequence())).toEqual({
      ok: true,
      journal,
      exportedAt: NOW,
    })
  })

  it('gives a fact without an id, or sharing one, a new one in a version 2 file too', () => {
    const [quitMoment, ...others] = journal.facts
    const unidentified = { type: 'lapse', at: QUIT + 5 * DAY, count: 1 }
    const repeated = { type: 'lapse', id: factId(1), at: QUIT + 6 * DAY, count: 1 }
    const imported = importJournal(
      withFacts(quitMoment, ...others, unidentified, repeated),
      'device',
      factIdSequence(90),
    )

    expect(imported.ok && imported.journal.facts.map((fact) => fact.id)).toEqual([
      factId(1),
      factId(2),
      factId(3),
      factId(4),
      factId(90),
      factId(91),
    ])
  })

  it('reads an export back into the journal it was made from, ids included', () => {
    expect(
      importJournal(exportJournal(journal, NOW, 'device'), 'device', factIdSequence()),
    ).toEqual({
      ok: true,
      journal,
      exportedAt: NOW,
    })
  })

  it.each(scenarios.map((scenario) => [scenario.id, scenario] as const))(
    'derives every figure of %s exactly as the exporting device did',
    (_id, scenario) => {
      const imported = importJournal(
        exportJournal(scenario.journal, scenario.now, 'device'),
        'device',
        factIdSequence(),
      )

      expect(imported.ok && derive(imported.journal, scenario.now)).toEqual(
        derive(scenario.journal, scenario.now),
      )
    },
  )

  it('reads a journal whose spend, baseline and goal were never set', () => {
    const unset: Journal = {
      ...journal,
      weeklySpendCents: null,
      baselineSmokesPerDay: null,
      goal: null,
    }

    expect(
      importJournal(exportJournal(unset, NOW, 'device'), 'device', factIdSequence()),
    ).toMatchObject({
      ok: true,
      journal: unset,
    })
  })

  it('reads a craving from before the quit moment, as recording allows it', () => {
    const early = {
      type: 'craving',
      id: factId(5),
      at: QUIT - DAY,
      intensity: 1,
      heldToEnd: false,
      tags: [],
    }

    expect(importJournal(withFacts(...journal.facts, early), 'device', factIdSequence()).ok).toBe(
      true,
    )
  })

  it.each([
    ['empty', ''],
    ['not JSON', 'quit'],
    ['truncated', exportJournal(journal, NOW, 'device').slice(0, -12)],
  ])('refuses a file that is %s as unreadable', (_case, text) => {
    expect(importJournal(text, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'unreadable',
    })
  })

  it.each([
    ['a JSON list', '[]'],
    ['JSON null', 'null'],
    ['another format', JSON.stringify({ ...exported(), format: 'other-app' })],
    ['a file without a journal', JSON.stringify({ ...exported(), journal: undefined })],
    ['a file without an export time', JSON.stringify({ ...exported(), exportedAt: 'today' })],
    ['a bare journal', JSON.stringify(journal)],
  ])('refuses %s as not an export', (_case, text) => {
    expect(importJournal(text, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'not-an-export',
    })
  })

  it.each([
    ['a later version', 3],
    ['version zero', 0],
    ['no version', undefined],
    ['a version as text', '1'],
  ])('refuses %s', (_case, version) => {
    expect(
      importJournal(JSON.stringify({ ...exported(), version }), 'device', factIdSequence()),
    ).toEqual({
      ok: false,
      reason: 'unsupported-version',
    })
  })

  it('refuses a fact type this version does not know, whatever else the file holds', () => {
    const checkIn = { type: 'mood-check', id: factId(5), at: QUIT + DAY, mood: 4 }

    expect(importJournal(withFacts(...journal.facts, checkIn), 'device', factIdSequence())).toEqual(
      {
        ok: false,
        reason: 'unknown-fact-type',
      },
    )
  })

  it.each([
    [
      'a craving rated 4',
      { type: 'craving', id: factId(5), at: QUIT, intensity: 4, heldToEnd: true, tags: [] },
    ],
    ['a patch application without a dose', { type: 'patch-application', id: factId(5), at: QUIT }],
    [
      'a patch application on an unknown site',
      { type: 'patch-application', id: factId(5), at: QUIT, doseMg: 21, site: 'knee' },
    ],
    ['a lapse of half a cigarette', { type: 'lapse', id: factId(5), at: QUIT + DAY, count: 0.5 }],
    ['a quit moment without a time', { type: 'quit-moment', id: factId(5) }],
    ['a fact that is not an object', 'lapse'],
  ])('refuses %s instead of dropping it', (_case, fact) => {
    expect(importJournal(withFacts(...journal.facts, fact), 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'invalid-fact',
    })
  })

  it('refuses facts that are not a list', () => {
    expect(importJournal(withJournal({ facts: {} }), 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'invalid-fact',
    })
  })

  it.each([
    ['a lapse', { type: 'lapse', id: factId(5), at: QUIT - HOUR, count: 1 }],
    [
      'a patch application',
      { type: 'patch-application', id: factId(5), at: QUIT - HOUR, doseMg: 21 },
    ],
  ])('refuses %s before the quit moment', (_case, fact) => {
    expect(importJournal(withFacts(...journal.facts, fact), 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('checks facts against the quit moment in force, the latest one recorded', () => {
    const corrected = { type: 'quit-moment', id: factId(5), at: QUIT + 2 * HOUR }

    expect(
      importJournal(withFacts(...journal.facts, corrected), 'device', factIdSequence()),
    ).toEqual({
      ok: false,
      reason: 'before-quit-moment',
    })
  })

  it('refuses a journal without a quit moment: there is no journey to restore', () => {
    expect(
      importJournal(exportJournal(emptyJournal, NOW, 'device'), 'device', factIdSequence()),
    ).toEqual({
      ok: false,
      reason: 'no-quit-moment',
    })
  })

  it('names the first broken fact: an unknown type after a malformed fact is still invalid', () => {
    const malformed = { type: 'lapse', id: factId(5), at: QUIT + DAY, count: 0 }
    const checkIn = { type: 'mood-check', id: factId(6), at: QUIT + DAY, mood: 4 }

    expect(
      importJournal(withFacts(...journal.facts, malformed, checkIn), 'device', factIdSequence()),
    ).toEqual({
      ok: false,
      reason: 'invalid-fact',
    })
    expect(
      importJournal(withFacts(...journal.facts, checkIn, malformed), 'device', factIdSequence()),
    ).toEqual({
      ok: false,
      reason: 'unknown-fact-type',
    })
  })

  it('refuses a fact without a type as invalid, not as unknown', () => {
    expect(
      importJournal(
        withFacts(...journal.facts, { id: factId(5), at: QUIT + DAY }),
        'device',
        factIdSequence(),
      ),
    ).toEqual({
      ok: false,
      reason: 'invalid-fact',
    })
  })

  it('reports broken settings before broken facts', () => {
    const text = withJournal({ weeklySpendCents: 48.9, facts: [...journal.facts, 'lapse'] })

    expect(importJournal(text, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'invalid-settings',
    })
  })

  it('refuses a sandbox export over the real journal before reading what it holds', () => {
    const text = JSON.stringify({ ...exported(), origin: 'sandbox', journal: { facts: 'none' } })

    expect(importJournal(text, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'sandbox-file',
    })
  })

  it('refuses another format before looking at its version', () => {
    const text = JSON.stringify({ ...exported(), format: 'other-app', version: 7 })

    expect(importJournal(text, 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'not-an-export',
    })
  })

  it.each([
    ['a weekly spend in euros', { weeklySpendCents: 48.9 }],
    ['a missing weekly spend', { weeklySpendCents: undefined }],
    ['a baseline of zero', { baselineSmokesPerDay: 0 }],
    ['an empty protocol', { protocol: [] }],
    ['a step without a duration', { protocol: [{ doseMg: 21 }] }],
    ['a protocol that is not a list', { protocol: 'default' }],
    ['a goal priced in euros', { goal: { ...journal.goal, priceCents: 450.5 } }],
    ['a goal without a label', { goal: { ...journal.goal, label: '  ' } }],
  ])('refuses %s instead of replacing it with a default', (_case, changes) => {
    expect(importJournal(withJournal(changes), 'device', factIdSequence())).toEqual({
      ok: false,
      reason: 'invalid-settings',
    })
  })
})
