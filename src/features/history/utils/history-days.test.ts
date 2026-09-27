import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { historyDays, historyFactAt } from './history-days'

const QUIT = new Date(2026, 0, 1, 9, 0).getTime()
const at = (day: number, hour: number, minute = 0) => new Date(2026, 0, day, hour, minute).getTime()

const journal: Journal = {
  ...emptyJournal,
  facts: [
    { type: 'quit-moment', at: QUIT },
    { type: 'patch-application', at: at(1, 9, 5), doseMg: 21 },
    { type: 'lapse', at: at(2, 22), count: 2 },
    { type: 'craving', at: at(1, 14), intensity: 2, heldToEnd: true, tags: [] },
    { type: 'patch-application', at: at(2, 8), doseMg: 21 },
  ],
}

it('lists every recorded fact newest first, grouped by local day, each with its index', () => {
  expect(historyDays(journal)).toEqual([
    {
      day: at(2, 0),
      items: [
        { index: 2, fact: { type: 'lapse', at: at(2, 22), count: 2 } },
        { index: 4, fact: { type: 'patch-application', at: at(2, 8), doseMg: 21 } },
      ],
    },
    {
      day: at(1, 0),
      items: [
        {
          index: 3,
          fact: { type: 'craving', at: at(1, 14), intensity: 2, heldToEnd: true, tags: [] },
        },
        { index: 1, fact: { type: 'patch-application', at: at(1, 9, 5), doseMg: 21 } },
      ],
    },
  ])
})

it('leaves the quit moment out: it anchors the history, it is not an item of it', () => {
  const onlyQuit: Journal = { ...emptyJournal, facts: [{ type: 'quit-moment', at: QUIT }] }

  expect(historyDays(onlyQuit)).toEqual([])
})

it('puts the one recorded last first on a tie', () => {
  const tie: Journal = {
    ...emptyJournal,
    facts: [
      { type: 'lapse', at: at(3, 10), count: 1 },
      { type: 'lapse', at: at(3, 10), count: 3 },
    ],
  }

  expect(historyDays(tie)[0]?.items.map((item) => item.index)).toEqual([1, 0])
})

describe('historyFactAt', () => {
  it('finds the fact an item points to', () => {
    expect(historyFactAt(journal, 2)).toEqual({ type: 'lapse', at: at(2, 22), count: 2 })
  })

  it('finds nothing at the quit moment, past the end or at a non-index', () => {
    expect(historyFactAt(journal, 0)).toBeNull()
    expect(historyFactAt(journal, 5)).toBeNull()
    expect(historyFactAt(journal, Number('x'))).toBeNull()
  })
})
