/** The heatmap's fixed buckets, so a day keeps its colour month to month. */
export type CravingBucket = 0 | 1 | 2 | 3

/** Cravings in one day → bucket: 0 · 1–2 · 3–5 · 6+. */
export function cravingBucket(count: number): CravingBucket {
  if (count >= 6) return 3
  if (count >= 3) return 2
  return count >= 1 ? 1 : 0
}
