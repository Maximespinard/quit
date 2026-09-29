import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { factId } from '@/shared/test/fact-ids'
import { historyDays, historyFact } from './history-days'

const QUIT = new Date(2026, 0, 1, 9, 0).getTime()
const at = (day: number, hour: number, minute = 0) => new Date(2026, 0, day, hour, minute).getTime()

const journal: Journal = {
  ...emptyJournal,
  facts: [
    { type: 'quit-moment', id: factId(1), at: QUIT },
    { type: 'patch-application', id: factId(2), at: at(1, 9, 5), doseMg: 21 },
    { type: 'lapse', id: factId(3), at: at(2, 22), count: 2 },
    { type: 'craving', id: factId(4), at: at(1, 14), intensity: 2, heldToEnd: true, tags: [] },
    { type: 'patch-application', id: factId(5), at: at(2, 8), doseMg: 21 },
  ],
}

it('lists every recorded fact newest first, grouped by local day, each with its id', () => {
  expect(historyDays(journal)).toEqual([
    {
      day: at(2, 0),
      items: [
        { id: factId(3), fact: { type: 'lapse', id: factId(3), at: at(2, 22), count: 2 } },
        {
          id: factId(5),
          fact: { type: 'patch-application', id: factId(5), at: at(2, 8), doseMg: 21 },
        },
      ],
    },
    {
      day: at(1, 0),
      items: [
        {
          id: factId(4),
          fact: {
            type: 'craving',
            id: factId(4),
            at: at(1, 14),
            intensity: 2,
            heldToEnd: true,
            tags: [],
          },
        },
        {
          id: factId(2),
          fact: { type: 'patch-application', id: factId(2), at: at(1, 9, 5), doseMg: 21 },
        },
      ],
    },
  ])
})

it('leaves the quit moment out: it anchors the history, it is not an item of it', () => {
  const onlyQuit: Journal = {
    ...emptyJournal,
    facts: [{ type: 'quit-moment', id: factId(1), at: QUIT }],
  }

  expect(historyDays(onlyQuit)).toEqual([])
})

it('puts the one recorded last first on a tie', () => {
  const tie: Journal = {
    ...emptyJournal,
    facts: [
      { type: 'lapse', id: factId(1), at: at(3, 10), count: 1 },
      { type: 'lapse', id: factId(2), at: at(3, 10), count: 3 },
    ],
  }

  expect(historyDays(tie)[0]?.items.map((item) => item.id)).toEqual([factId(2), factId(1)])
})

it('leaves out a fact without an id: nothing could open it', () => {
  const unidentified: Journal = {
    ...emptyJournal,
    facts: [{ type: 'lapse', at: at(3, 10), count: 1 }],
  }

  expect(historyDays(unidentified)).toEqual([])
})

describe('historyFact', () => {
  it('finds the fact an item points to', () => {
    expect(historyFact(journal, factId(3))).toEqual({
      type: 'lapse',
      id: factId(3),
      at: at(2, 22),
      count: 2,
    })
  })

  it('finds nothing for the quit moment, an unknown id or a value that is no id', () => {
    expect(historyFact(journal, factId(1))).toBeNull()
    expect(historyFact(journal, factId(9))).toBeNull()
    expect(historyFact(journal, '3')).toBeNull()
  })
})
