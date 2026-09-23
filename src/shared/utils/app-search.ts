/**
 * Search params every route shares. `?debug=true` opens the debug panel on the sandbox
 * journal; `&clock=<ms>` stops the sandbox clock on that instant (end-to-end tests).
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
