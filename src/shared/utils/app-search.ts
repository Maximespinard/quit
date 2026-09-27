import { isScenarioId, type ScenarioId } from '@/shared/domain/scenarios'

/**
 * Search params every route shares. `?debug=true` switches to the sandbox and its debug
 * panel; `&scenario=<id>` seeds it from a scenario; `&clock=<ms>` stops the sandbox clock on
 * that instant (end-to-end tests).
 */
export type AppSearch = {
  readonly debug?: true
  readonly clock?: number
  readonly scenario?: ScenarioId
}

export function validateAppSearch(search: Record<string, unknown>): AppSearch {
  const { debug, clock, scenario } = search
  return {
    ...(debug === true ? { debug } : {}),
    ...(typeof clock === 'number' && Number.isFinite(clock) ? { clock } : {}),
    ...(isScenarioId(scenario) ? { scenario } : {}),
  }
}

/**
 * Every in-app link keeps the current search: it carries the sandbox, and dropping it would
 * land on the real journal.
 */
export const keepSearch = (current: AppSearch): AppSearch => current

/** Which journal and which clock the app runs on. Demo mode will be a third kind. */
export type JournalSourceChoice =
  | { readonly kind: 'real' }
  | {
      readonly kind: 'sandbox'
      /** The instant the sandbox clock starts stopped on; `null` follows the scenario's clock, or real time. */
      readonly clockAt: number | null
      /** The scenario the sandbox starts from, or `null` for an empty journal. */
      readonly scenario: ScenarioId | null
    }

/** The journal source switch: the url alone decides, so the first render never touches the wrong one. */
export function journalSourceFrom(search: AppSearch): JournalSourceChoice {
  if (search.debug !== true) return { kind: 'real' }
  return { kind: 'sandbox', clockAt: search.clock ?? null, scenario: search.scenario ?? null }
}
