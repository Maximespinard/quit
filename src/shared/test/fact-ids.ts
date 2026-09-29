import type { FactId } from '@quit/contract/facts'

/** The `n`th fixed fact id: a valid UUIDv7, readable in a failing test. */
export const factId = (n: number): FactId =>
  `00000000-0000-7000-8000-${n.toString(16).padStart(12, '0')}`

/** An id source handing out `factId(1)`, `factId(2)`, … in turn: where the device would make new ones. */
export function factIdSequence(): () => FactId {
  let n = 0
  return () => {
    n += 1
    return factId(n)
  }
}
