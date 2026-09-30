import type { Page } from '@playwright/test'
import { button, tap } from './locators'

/** `path` in the sandbox, its clock stopped on `at`: time is deterministic. */
export const sandboxAt = (at: number, path = '/') => `${path}?debug=true&clock=${at}`

/** `path` in a sandbox loaded with a scenario, its clock stopped on the scenario's. */
export const sandboxWith = (scenario: string, path = '/') =>
  `${path}?debug=true&scenario=${scenario}`

/** The sandbox marker, which opens the debug panel. */
export const sandboxMarker = (page: Page) => button(page, 'Bac à sable')

/** The debug panel's count of the facts in the sandbox journal. */
export const factCount = (page: Page) => page.getByText(/^\d+ faits?$/)

/** Moves the sandbox clock by the debug panel's `shift` button, `times` times over. */
export async function shiftClock(page: Page, shift: string, times = 1) {
  await sandboxMarker(page).click()
  for (let i = 0; i < times; i += 1) await tap(page, shift)
  await tap(page, 'Fermer')
}

/** Moves the sandbox clock on by whole days. */
export const daysLater = (page: Page, days: number) => shiftClock(page, '+1 j', days)
