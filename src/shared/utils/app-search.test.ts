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

    expect(journalSourceFrom({ debug: true, clock: at })).toEqual({ kind: 'sandbox', clockAt: at })
    expect(journalSourceFrom({ debug: true })).toEqual({ kind: 'sandbox', clockAt: null })
  })
})
