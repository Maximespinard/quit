/** A time elapsed up to `now`, in ms. Only the display layer divides it. */
export type Elapsed = {
  readonly elapsedMs: number
}

/** Time elapsed since the latest relapse, or since the quit moment. */
export type Streak = Elapsed

/**
 * The streak running at `now`, and the longest one ever held — `null` until a relapse
 * exists. Only relapses restart it: a slip leaves it running.
 */
export function streaks(
  quitMoment: number,
  /** Every moment a relapse restarted the streak, oldest first. */
  restarts: readonly number[],
  now: number,
): { readonly streak: Streak; readonly personalBest: Streak | null } {
  // Each streak runs from its start to the next one's; the last is still running.
  const starts = [quitMoment, ...restarts]
  const lengths = starts.map((start, index) => Math.max(0, (starts[index + 1] ?? now) - start))
  const current = lengths.at(-1) ?? 0
  return {
    streak: { elapsedMs: current },
    personalBest: restarts.length === 0 ? null : { elapsedMs: Math.max(...lengths) },
  }
}
