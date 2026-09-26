import { journalSourceFrom, validateAppSearch } from './app-search'

describe('validateAppSearch', () => {
  it('keeps nothing from an ordinary url', () => {
    expect(validateAppSearch({})).toEqual({})
  })

  it('opens the debug panel only on an explicit true', () => {
    expect(validateAppSearch({ debug: true })).toEqual({ debug: true })
    expect(validateAppSearch({ debug: 'true' })).toEqual({})
    expect(validateAppSearch({ debug: 1 })).toEqual({})
  })

  it('keeps a clock instant only as a finite number of ms', () => {
    const at = Date.UTC(2026, 0, 1, 12, 0, 0)

    expect(validateAppSearch({ debug: true, clock: at })).toEqual({ debug: true, clock: at })
    expect(validateAppSearch({ clock: '2026-01-01' })).toEqual({})
    expect(validateAppSearch({ clock: Number.POSITIVE_INFINITY })).toEqual({})
  })

  it('keeps a scenario only by a known id', () => {
    expect(validateAppSearch({ debug: true, scenario: 'day-29' })).toEqual({
      debug: true,
      scenario: 'day-29',
    })
    expect(validateAppSearch({ debug: true, scenario: 'day-30' })).toEqual({ debug: true })
    expect(validateAppSearch({ debug: true, scenario: 29 })).toEqual({ debug: true })
  })

  it('drops the params of a single route, so a navigation keeps only the shared ones', () => {
    expect(validateAppSearch({ debug: true, startedAt: 1, stoppedAt: 2 })).toEqual({ debug: true })
  })
})

describe('journalSourceFrom', () => {
  it('reads the real journal on real time by default', () => {
    expect(journalSourceFrom({})).toEqual({ kind: 'real' })
  })

  it('ignores a clock instant outside the sandbox', () => {
    expect(journalSourceFrom({ clock: Date.UTC(2026, 0, 1) })).toEqual({ kind: 'real' })
  })

  it('switches to the sandbox, its clock stopped on the given instant or following real time', () => {
    const at = Date.UTC(2026, 0, 1, 12, 0, 0)

    expect(journalSourceFrom({ debug: true, clock: at })).toEqual({
      kind: 'sandbox',
      clockAt: at,
      scenario: null,
    })
    expect(journalSourceFrom({ debug: true })).toEqual({
      kind: 'sandbox',
      clockAt: null,
      scenario: null,
    })
  })

  it('seeds the sandbox from a scenario, on its own clock unless one is given', () => {
    const at = Date.UTC(2026, 0, 1, 12, 0, 0)

    expect(journalSourceFrom({ debug: true, scenario: 'day-29' })).toEqual({
      kind: 'sandbox',
      clockAt: null,
      scenario: 'day-29',
    })
    expect(journalSourceFrom({ debug: true, scenario: 'day-29', clock: at })).toEqual({
      kind: 'sandbox',
      clockAt: at,
      scenario: 'day-29',
    })
  })

  it('ignores a scenario outside the sandbox: the real journal is never seeded', () => {
    expect(journalSourceFrom({ scenario: 'day-29' })).toEqual({ kind: 'real' })
  })
})
