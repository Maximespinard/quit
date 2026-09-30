import type { CravingBucket } from '../domain/craving-bucket'

/**
 * The fill of a lived day by craving bucket: the home haze's own colours on one path, floor →
 * ember → amber, in four evenly spaced lightness steps (0.23, 0.33, 0.44, 0.54). Cream text and
 * marks hold ≥ 4.9:1 on every one.
 */
export const cravingHeat: Record<CravingBucket, string> = {
  0: 'color-mix(in oklab, var(--color-floor) 50%, var(--color-surface))',
  1: 'color-mix(in oklab, var(--color-floor), var(--color-ember) 40%)',
  2: 'var(--color-ember)',
  3: 'color-mix(in oklab, var(--color-ember), var(--color-amber) 56%)',
}
