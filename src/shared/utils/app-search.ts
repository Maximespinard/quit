/**
 * Search params every route shares. `?debug=true` switches to the sandbox and its debug
 * panel; `&clock=<ms>` stops the sandbox clock on that instant (end-to-end tests).
 */
export type AppSearch = {
  readonly debug?: true
  readonly clock?: number
}

export function validateAppSearch(search: Record<string, unknown>): AppSearch {
  const { debug, clock } = search
  return {
    ...(debug === true ? { debug } : {}),
    ...(typeof clock === 'number' && Number.isFinite(clock) ? { clock } : {}),
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
  /** `clockAt`: the instant the sandbox clock starts stopped on, or `null` to follow real time. */
  | { readonly kind: 'sandbox'; readonly clockAt: number | null }

/** The journal source switch: the url alone decides, so the first render never touches the wrong one. */
export function journalSourceFrom(search: AppSearch): JournalSourceChoice {
  if (search.debug !== true) return { kind: 'real' }
  return { kind: 'sandbox', clockAt: search.clock ?? null }
}
