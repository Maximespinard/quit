import type { FactId } from '@quit/contract/facts'
import { factId, UUID_V7 } from '@/shared/utils/fact-id'

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
export const anyFactId = expect.stringMatching(new RegExp(`^${UUID_V7.source}$`))
