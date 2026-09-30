import { expect } from '@playwright/test'

/** A UUIDv7, as the device makes fact ids. */
export const UUID_V7 = /[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

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
