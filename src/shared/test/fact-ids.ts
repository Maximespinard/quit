import type { FactId } from '@quit/contract/facts'
import { factId } from '@/shared/utils/fact-id'

/**
 * An id source handing out `factId(first)`, `factId(first + 1)`, … in turn: where the device
 * would make new ones.
 */
export function factIdSequence(first = 1): () => FactId {
  let n = first - 1
  return () => {
    n += 1
    return factId(n)
  }
}

/** Any UUIDv7: the id the device made for a fact a test recorded, unknown in advance. */
export const anyFactId = expect.stringMatching(
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
)
