import { validateAppSearch } from './app-search'

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
})
