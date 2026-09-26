import { decodeJournal, emptyJournal } from './journal'
import { defaultProtocol } from './protocol'

describe('decodeJournal', () => {
  it('reads nothing stored as a new journal', () => {
    expect(decodeJournal(undefined)).toEqual(emptyJournal)
  })

  it('gives a journal stored before the protocol existed the default protocol, facts kept', () => {
    const stored = { facts: [{ type: 'quit-moment', at: 1_000 }] }

    expect(decodeJournal(stored)).toEqual({
      ...emptyJournal,
      facts: [{ type: 'quit-moment', at: 1_000 }],
      protocol: defaultProtocol,
    })
  })

  it('reads back an edited protocol', () => {
    const protocol = [{ doseMg: 14, durationDays: 21, brand: 'Nicopatch' }]

    expect(decodeJournal({ facts: [], protocol })).toEqual({ ...emptyJournal, protocol })
  })
})

describe('decodeJournal, settings', () => {
  it('reads back the weekly spend and the baseline', () => {
    const stored = { facts: [], weeklySpendCents: 3_550, baselineSmokesPerDay: 15 }

    expect(decodeJournal(stored)).toEqual({
      ...emptyJournal,
      weeklySpendCents: 3_550,
      baselineSmokesPerDay: 15,
    })
  })

  it('reads a journal stored before the settings existed as not set yet', () => {
    const decoded = decodeJournal({ facts: [] })

    expect(decoded.weeklySpendCents).toBeNull()
    expect(decoded.baselineSmokesPerDay).toBeNull()
  })

  it('drops a malformed spend or baseline rather than trusting it', () => {
    const decoded = decodeJournal({ facts: [], weeklySpendCents: 12.5, baselineSmokesPerDay: -2 })

    expect(decoded.weeklySpendCents).toBeNull()
    expect(decoded.baselineSmokesPerDay).toBeNull()
  })
})
