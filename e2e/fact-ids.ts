import { expect } from '@playwright/test'
import { UUID_V7 } from '../src/shared/utils/fact-id'

/** A fact as stored or exported: its id, if any, beside its other keys. */
export type IdentifiedFact = { readonly id?: string } & Record<string, unknown>

/** Every fact carries its own UUIDv7 id: none missing, none shared. */
export function expectIdentified(facts: readonly IdentifiedFact[]) {
  const ids = facts.map((fact) => fact.id ?? '')
  expect(ids.length).toBeGreaterThan(0)
  expect(ids.every((id) => new RegExp(`^${UUID_V7.source}$`).test(id))).toBe(true)
  expect(new Set(ids).size).toBe(ids.length)
}

/** The facts without their ids, as a version 1 file or the previous storage held them. */
export const withoutIds = (facts: readonly IdentifiedFact[]) =>
  facts.map(({ id: _id, ...fact }) => fact)
