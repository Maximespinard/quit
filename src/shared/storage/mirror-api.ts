import type { MirrorChange } from '@/shared/domain/pending-changes'

/**
 * What became of one change sent to the mirror: stored, refused for good (its shape — sending
 * it again would change nothing), the device key refused, or no answer worth trusting: the
 * server unreachable, busy, or not the mirror at all.
 */
export type Delivery = 'acknowledged' | 'refused' | 'revoked' | 'unreachable'

/** A request still unanswered after this long is given up: the pending changes must not hang on it. */
const REQUEST_TIMEOUT_MS = 15_000

export type MirrorApi = {
  /** Where the API lives: `''` for this origin, which serves both the app and `/api`. */
  readonly apiBase: string
  readonly deviceKey: string
  readonly fetch: typeof fetch
}

/** The request that replays `change` on the mirror (ADR-0003): idempotent, one fact at a time. */
function requestFor(change: MirrorChange): { method: string; path: string; body?: unknown } {
  switch (change.kind) {
    case 'put-fact':
      return { method: 'PUT', path: `/api/facts/${change.fact.id}`, body: change.fact }
    case 'delete-fact':
      return { method: 'DELETE', path: `/api/facts/${change.id}` }
    case 'put-settings':
      return { method: 'PUT', path: '/api/settings', body: change.settings }
  }
}

/** Every mirror write answers 204: anything else, even a 200, was not stored by the mirror. */
function deliveryOf(status: number): Delivery {
  if (status === 204) return 'acknowledged'
  if (status === 401) return 'revoked'
  if (status === 400 || status === 413) return 'refused'
  return 'unreachable'
}

/** Sends one change to the mirror; never throws. */
export async function deliverChange(change: MirrorChange, api: MirrorApi): Promise<Delivery> {
  const { method, path, body } = requestFor(change)
  const headers: Record<string, string> = { authorization: `Bearer ${api.deviceKey}` }
  if (body !== undefined) headers['content-type'] = 'application/json'
  try {
    const response = await api.fetch(`${api.apiBase}${path}`, {
      method,
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    // Nothing in an answer's body matters: dropped, so the connection is free again.
    await response.body?.cancel().catch(() => {})
    return deliveryOf(response.status)
  } catch {
    return 'unreachable'
  }
}
