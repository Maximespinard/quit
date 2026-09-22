import { quitMomentModule } from './quit-moment'

/**
 * Every fact type the journal knows. Adding one is its own module plus one line here:
 * the `Fact` union and the journal decoder follow from this list.
 */
export const factModules = [quitMomentModule] as const

export type Fact = NonNullable<ReturnType<(typeof factModules)[number]['decode']>>

/** Turns a stored value back into a known fact, or `null` when no module claims it. */
export function decodeFact(raw: unknown): Fact | null {
  for (const module of factModules) {
    const fact = module.decode(raw)
    if (fact) return fact
  }
  return null
}
