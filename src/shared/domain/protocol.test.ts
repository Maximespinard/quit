import { decodeJournal, emptyJournal } from './journal'
import { defaultProtocol, isSameProtocol, setProtocol } from './protocol'

describe('defaultProtocol', () => {
  it('tapers 21, 14 then 7 mg', () => {
    expect(defaultProtocol.map((step) => step.doseMg)).toEqual([21, 14, 7])
  })

  it('lasts 4 weeks per step, the upper bound of the notices (docs/research/patch-step-durations.md)', () => {
    expect(defaultProtocol.map((step) => step.durationDays)).toEqual([28, 28, 28])
  })
})

describe('setProtocol', () => {
  it('replaces the protocol and keeps every fact', () => {
    const journal = { ...emptyJournal, facts: [{ type: 'quit-moment' as const, at: 1_000 }] }
    const steps = [
      { doseMg: 25, durationDays: 42, brand: 'Nicopatch' },
      { doseMg: 10, durationDays: 14 },
    ]

    expect(setProtocol(journal, steps)).toEqual({
      ok: true,
      journal: { ...journal, protocol: steps },
    })
  })

  it('refuses a protocol with zero steps', () => {
    expect(setProtocol(emptyJournal, [])).toEqual({ ok: false, reason: 'empty' })
  })

  it.each([
    ['a zero dose', { doseMg: 0, durationDays: 7 }],
    ['a negative dose', { doseMg: -7, durationDays: 7 }],
    ['a zero duration', { doseMg: 7, durationDays: 0 }],
    ['a fractional duration', { doseMg: 7, durationDays: 1.5 }],
  ])('refuses %s', (_, step) => {
    expect(setProtocol(emptyJournal, [step])).toEqual({ ok: false, reason: 'invalid' })
  })

  it('accepts a half dose from a cut patch', () => {
    const steps = [{ doseMg: 3.5, durationDays: 7 }]

    expect(setProtocol(emptyJournal, steps)).toMatchObject({ ok: true })
  })

  it('drops a blank brand and trims a filled one', () => {
    const result = setProtocol(emptyJournal, [
      { doseMg: 21, durationDays: 28, brand: '   ' },
      { doseMg: 14, durationDays: 14, brand: '  Niquitin ' },
    ])

    expect(result.ok && result.journal.protocol).toEqual([
      { doseMg: 21, durationDays: 28 },
      { doseMg: 14, durationDays: 14, brand: 'Niquitin' },
    ])
  })
})

describe('isSameProtocol', () => {
  const first = { doseMg: 21, durationDays: 28 }
  const last = { doseMg: 7, durationDays: 28 }

  it('holds for the protocol in force, even with a blank or padded brand', () => {
    const inForce = [
      { doseMg: 21, durationDays: 28 },
      { doseMg: 14, durationDays: 28, brand: 'Niquitin' },
    ]

    expect(
      isSameProtocol(inForce, [
        { doseMg: 21, durationDays: 28, brand: '  ' },
        { doseMg: 14, durationDays: 28, brand: ' Niquitin ' },
      ]),
    ).toBe(true)
  })

  it.each([
    ['a dose', [{ ...first, doseMg: 14 }, last]],
    ['a duration', [{ ...first, durationDays: 21 }, last]],
    ['a brand', [{ ...first, brand: 'Nicopatch' }, last]],
    ['the order', [last, first]],
    ['an added step', [first, last, last]],
    ['a removed step', [first]],
    ['an unreadable dose', [{ ...first, doseMg: Number.NaN }, last]],
  ])('breaks on %s', (_, steps) => {
    expect(isSameProtocol([first, last], steps)).toBe(false)
  })
})

describe('decodeJournal, protocol', () => {
  it('reads back a stored protocol', () => {
    const stored = [{ doseMg: 21, durationDays: 28, brand: 'Nicotinell' }]

    expect(decodeJournal({ facts: [], protocol: stored }).protocol).toEqual(stored)
  })

  it.each([
    ['nothing', undefined],
    ['an empty list', []],
    ['a malformed step', [{ doseMg: '21', durationDays: 28 }]],
  ])('falls back to the default protocol from %s', (_, raw) => {
    expect(decodeJournal({ facts: [], protocol: raw }).protocol).toEqual(defaultProtocol)
  })
})
