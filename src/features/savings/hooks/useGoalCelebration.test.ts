import { renderHook } from '@testing-library/react'
import type { GoalProgress } from '@/shared/domain/derive'
import { emptyJournal, type Journal } from '@/shared/domain/journal'
import { useGoalCelebration } from './useGoalCelebration'

const journal: Journal = {
  ...emptyJournal,
  goal: { label: 'Un casque', priceCents: 12_000, countsFrom: null, celebrated: false },
}

const progress = (reached: boolean, celebrated: boolean): GoalProgress => ({
  label: 'Un casque',
  priceCents: 12_000,
  savedCents: reached ? 12_000 : 6_000,
  reached,
  celebrated,
})

describe('useGoalCelebration', () => {
  it('celebrates a goal reached on first sight and stores that it was seen', () => {
    const onCelebrated = vi.fn(() => Promise.resolve())

    const { result } = renderHook(() =>
      useGoalCelebration(journal, progress(true, false), onCelebrated),
    )

    expect(result.current).toBe(true)
    expect(onCelebrated).toHaveBeenCalledWith({
      ...journal,
      goal: { ...journal.goal, celebrated: true },
    })
  })

  it('celebrates when the goal is reached live, and keeps celebrating once stored', () => {
    const onCelebrated = vi.fn(() => Promise.resolve())
    const { result, rerender } = renderHook(
      ({ goal }) => useGoalCelebration(journal, goal, onCelebrated),
      { initialProps: { goal: progress(false, false) } },
    )
    expect(result.current).toBe(false)

    rerender({ goal: progress(true, false) })
    expect(result.current).toBe(true)
    rerender({ goal: progress(true, true) })

    expect(result.current).toBe(true)
    expect(onCelebrated).toHaveBeenCalledTimes(1)
  })

  it('never celebrates again once seen', () => {
    const onCelebrated = vi.fn(() => Promise.resolve())

    const { result } = renderHook(() =>
      useGoalCelebration(journal, progress(true, true), onCelebrated),
    )

    expect(result.current).toBe(false)
    expect(onCelebrated).not.toHaveBeenCalled()
  })
})
