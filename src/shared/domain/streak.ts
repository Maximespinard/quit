export type Streak = {
  /** Time elapsed since the latest relapse, or since the quit moment, in ms. Only the display layer divides it. */
  readonly elapsedMs: number
}

/**
 * The streak running at `now`, and the longest one ever held — `null` until a relapse
 * exists. Only relapses restart it: a slip leaves it running.
 */
export function streaks(
  quitMoment: number,
  relapses: readonly number[],
  now: number,
): { readonly streak: Streak; readonly personalBest: Streak | null } {
  // Each streak runs from its start to the next one's; the last is still running.
  const starts = [quitMoment, ...relapses]
  const lengths = starts.map((start, index) => Math.max(0, (starts[index + 1] ?? now) - start))
  const current = lengths.at(-1) ?? 0
  return {
    streak: { elapsedMs: current },
    personalBest: relapses.length === 0 ? null : { elapsedMs: Math.max(...lengths) },
  }
}
