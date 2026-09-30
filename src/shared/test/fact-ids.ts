import type { FactId } from '@quit/contract/facts'
import { factId } from '@/shared/utils/fact-id'
import { ONLY_UUID_V7 } from './uuid-v7'

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
export const anyFactId = expect.stringMatching(ONLY_UUID_V7)
