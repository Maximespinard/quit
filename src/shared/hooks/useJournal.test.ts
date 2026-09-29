import { factIdSchema } from '@quit/contract/facts'
import { act, renderHook, waitFor } from '@testing-library/react'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { createMemoryJournalStore } from '@/shared/storage/memory-journal-store'
import { factId } from '@/shared/test/fact-ids'
import { useJournal } from './useJournal'

const QUIT = Date.UTC(2026, 0, 1, 9, 0, 0)

const readyJournal = (state: ReturnType<typeof useJournal>['state']): Journal => {
  if (state.status !== 'ready') throw new Error(`journal ${state.status}`)
  return state.journal
}

const isFactId = (id: unknown) => factIdSchema.safeParse(id).success

describe('useJournal', () => {
  it('stores every newly recorded fact with a UUIDv7 id, and exposes the version stored', async () => {
    const store = createMemoryJournalStore()
    const { result } = renderHook(() => useJournal(store))
    await waitFor(() => expect(result.current.state.status).toBe('ready'))

    await act(() =>
      result.current.commit({
        ...emptyJournal,
        facts: [
          { type: 'quit-moment', id: factId(1), at: QUIT },
          { type: 'lapse', at: QUIT + 1_000, count: 1 },
        ],
      }),
    )

    const { facts } = readyJournal(result.current.state)
    expect(facts[0]?.id).toBe(factId(1))
    expect(isFactId(facts[1]?.id)).toBe(true)
    expect((await store.load()).facts).toEqual(facts)
  })

  it('gives an id to every fact of a journal loaded without them, as a scenario is', async () => {
    const store = createMemoryJournalStore({
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', at: QUIT },
        { type: 'lapse', at: QUIT + 1_000, count: 2 },
      ],
    })
    const { result } = renderHook(() => useJournal(store))

    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    const { facts } = readyJournal(result.current.state)
    expect(facts.every((fact) => isFactId(fact.id))).toBe(true)
    expect(facts.map(({ id: _id, ...fact }) => fact)).toEqual([
      { type: 'quit-moment', at: QUIT },
      { type: 'lapse', at: QUIT + 1_000, count: 2 },
    ])
  })
})
