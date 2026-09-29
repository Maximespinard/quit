import type { Fact } from '@quit/contract/facts'
import { factId } from '@/shared/utils/fact-id'
import { emptyJournal, type Journal } from './journal'
import {
  acknowledgeChange,
  decodePendingChanges,
  journalChanges,
  type PendingChange,
  queueChanges,
} from './pending-changes'

const quit: Fact = { type: 'quit-moment', id: factId(1), at: 1_000 }
const craving: Fact = {
  type: 'craving',
  id: factId(2),
  at: 2_000,
  intensity: 2,
  heldToEnd: false,
  tags: ['coffee'],
}
const lapse: Fact = { type: 'lapse', id: factId(3), at: 3_000, count: 1 }

const journalOf = (...facts: Fact[]): Journal => ({ ...emptyJournal, facts })

const settingsOf = ({ protocol, weeklySpendCents, baselineSmokesPerDay, goal }: Journal) => ({
  protocol,
  weeklySpendCents,
  baselineSmokesPerDay,
  goal,
})

describe('journalChanges', () => {
  it('finds nothing between a journal and itself', () => {
    const journal = journalOf(quit, craving)

    expect(journalChanges(journal, { ...journal, facts: [...journal.facts] })).toEqual([])
  })

  it('puts a fact recorded since', () => {
    expect(journalChanges(journalOf(quit), journalOf(quit, craving))).toEqual([
      { kind: 'put-fact', fact: craving },
    ])
  })

  it('puts a corrected fact under its own id', () => {
    const corrected = { ...craving, intensity: 3 as const, tags: ['coffee', 'stress'] }

    expect(journalChanges(journalOf(quit, craving), journalOf(quit, corrected))).toEqual([
      { kind: 'put-fact', fact: corrected },
    ])
  })

  it('deletes a fact removed since, by its id', () => {
    expect(journalChanges(journalOf(quit, lapse), journalOf(quit))).toEqual([
      { kind: 'delete-fact', id: lapse.id },
    ])
  })

  it('puts the whole settings once any of them changed', () => {
    const after: Journal = { ...journalOf(quit), weeklySpendCents: 8_400 }

    expect(journalChanges(journalOf(quit), after)).toEqual([
      { kind: 'put-settings', settings: settingsOf(after) },
    ])
  })

  it('reads a key order change as no change', () => {
    const reordered: Fact = {
      tags: ['coffee'],
      heldToEnd: false,
      intensity: 2,
      at: 2_000,
      id: craving.id,
      type: 'craving',
    }
    const after = journalOf(reordered)

    expect(journalChanges(journalOf(craving), after)).toEqual([])
  })

  it('carries an imported journal as every difference with the one it replaced', () => {
    const imported: Journal = { ...journalOf(quit, lapse), baselineSmokesPerDay: 20 }

    expect(journalChanges(journalOf(quit, craving), imported)).toEqual([
      { kind: 'delete-fact', id: craving.id },
      { kind: 'put-fact', fact: lapse },
      { kind: 'put-settings', settings: settingsOf(imported) },
    ])
  })
})

describe('queueChanges', () => {
  it('appends changes in order, each stamped with when it was queued', () => {
    const queued = queueChanges(
      [],
      [
        { kind: 'put-fact', fact: quit },
        { kind: 'put-fact', fact: craving },
      ],
      5_000,
    )

    expect(queued).toEqual([
      { seq: 1, queuedAt: 5_000, change: { kind: 'put-fact', fact: quit } },
      { seq: 2, queuedAt: 5_000, change: { kind: 'put-fact', fact: craving } },
    ])
  })

  it('collapses changes to the same fact into the latest, where and since the first waited', () => {
    const first = queueChanges(
      [],
      [
        { kind: 'put-fact', fact: craving },
        { kind: 'put-fact', fact: lapse },
      ],
      5_000,
    )
    const corrected = { ...craving, intensity: 1 as const }
    const second = queueChanges(first, [{ kind: 'put-fact', fact: corrected }], 6_000)
    const third = queueChanges(second, [{ kind: 'delete-fact', id: craving.id }], 7_000)

    expect(third).toEqual([
      { seq: 4, queuedAt: 5_000, change: { kind: 'delete-fact', id: craving.id } },
      { seq: 2, queuedAt: 5_000, change: { kind: 'put-fact', fact: lapse } },
    ])
  })

  it('collapses settings changes into the latest settings', () => {
    const before = settingsOf(emptyJournal)
    const after = { ...before, weeklySpendCents: 9_000 }
    const first = queueChanges([], [{ kind: 'put-settings', settings: before }], 5_000)

    expect(queueChanges(first, [{ kind: 'put-settings', settings: after }], 6_000)).toEqual([
      { seq: 2, queuedAt: 5_000, change: { kind: 'put-settings', settings: after } },
    ])
  })
})

describe('acknowledgeChange', () => {
  const pending: readonly PendingChange[] = queueChanges(
    [],
    [
      { kind: 'put-fact', fact: quit },
      { kind: 'put-fact', fact: craving },
    ],
    5_000,
  )

  it('removes the change the mirror acknowledged', () => {
    expect(acknowledgeChange(pending, 1)).toEqual([
      { seq: 2, queuedAt: 5_000, change: { kind: 'put-fact', fact: craving } },
    ])
  })

  it('keeps a change replaced while its previous version was on its way', () => {
    const replaced = queueChanges(pending, [{ kind: 'delete-fact', id: quit.id }], 6_000)

    expect(acknowledgeChange(replaced, 1)).toEqual(replaced)
  })
})

describe('decodePendingChanges', () => {
  it('reads nothing stored as no pending change', () => {
    expect(decodePendingChanges(undefined)).toEqual([])
  })

  it('reads back what was stored', () => {
    const pending = queueChanges(
      [],
      [
        { kind: 'put-fact', fact: craving },
        { kind: 'delete-fact', id: lapse.id },
        { kind: 'put-settings', settings: settingsOf(emptyJournal) },
      ],
      5_000,
    )

    expect(decodePendingChanges(structuredClone(pending))).toEqual(pending)
  })

  it('drops a change it cannot read, keeping the others', () => {
    const stored = [
      { seq: 1, queuedAt: 5_000, change: { kind: 'put-fact', fact: { type: 'unknown' } } },
      { seq: 2, queuedAt: 5_000, change: { kind: 'delete-fact', id: lapse.id } },
    ]

    expect(decodePendingChanges(stored)).toEqual([
      { seq: 2, queuedAt: 5_000, change: { kind: 'delete-fact', id: lapse.id } },
    ])
  })
})
