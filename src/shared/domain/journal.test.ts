import { decodeJournal, emptyJournal } from './journal'
import { defaultProtocol } from './protocol'

describe('decodeJournal', () => {
  it('reads nothing stored as a new journal', () => {
    expect(decodeJournal(undefined)).toEqual(emptyJournal)
  })

  it('gives a journal stored before the protocol existed the default protocol, facts kept', () => {
    const stored = { facts: [{ type: 'quit-moment', at: 1_000 }] }

    expect(decodeJournal(stored)).toEqual({
      facts: [{ type: 'quit-moment', at: 1_000 }],
      protocol: defaultProtocol,
    })
  })

  it('reads back an edited protocol', () => {
    const protocol = [{ doseMg: 14, durationDays: 21, brand: 'Nicopatch' }]

    expect(decodeJournal({ facts: [], protocol })).toEqual({ facts: [], protocol })
  })
})
