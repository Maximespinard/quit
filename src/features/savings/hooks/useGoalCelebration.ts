import { useEffect, useRef, useState } from 'react'
import type { GoalProgress } from '@/shared/domain/derive'
import type { Journal } from '@/shared/domain/journal'
import { markGoalCelebrated } from '../domain/goal'

/**
 * Whether the goal reached is being celebrated on this screen. The first sight of it, on
 * arrival or live as the clock ticks, stores that it was seen, so it plays once only; the
 * screen then keeps celebrating until it is left.
 */
export function useGoalCelebration(
  journal: Journal,
  goal: GoalProgress | null,
  onCelebrated: (journal: Journal) => Promise<void>,
): boolean {
  const [celebrating, setCelebrating] = useState(false)
  // Until the store confirms, the journal still reads unseen: store it once, not per render.
  const stored = useRef(false)
  const due = goal?.reached === true && !goal.celebrated

  useEffect(() => {
    if (!due || stored.current) return
    stored.current = true
    setCelebrating(true)
    void onCelebrated(markGoalCelebrated(journal))
  }, [due, journal, onCelebrated])

  return celebrating
}
