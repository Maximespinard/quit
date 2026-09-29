const MAX_STEPS = 12
/** Absorbs float error in `progress × steps`, e.g. `(8 / 12) × 3` landing just under 2. */
const EPSILON = 1e-9

/**
 * The figure shown `progress` (0 to 1) of the way through a count-up to `target`: it moves in
 * whole steps, the way a mechanical counter lands, never a smooth interpolation. A small
 * figure moves one unit at a time; a large one in at most twelve jumps.
 */
export function countUpAt(target: number, progress: number): number {
  if (progress >= 1) return target
  const steps = Math.min(Math.abs(target), MAX_STEPS)
  if (steps === 0) return target
  const step = Math.floor(progress * steps + EPSILON)
  return Math.round((target * step) / steps)
}
