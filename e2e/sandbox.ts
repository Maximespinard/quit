import { expect, type Page } from '@playwright/test'

/** The home screen in the sandbox, its clock stopped on `at`: time is deterministic. */
export const sandboxAt = (at: number) => `/?debug=true&clock=${at}`

export const streakRegion = (page: Page) => page.getByRole('region', { name: 'Temps sans fumer' })

/**
 * The streak as a screen reader gets it: whole days, then the label and the `hh:mm:ss` clock.
 * `clock` is a regex source, so a still-running real clock can be matched with `\d\d`.
 */
export const expectStreak = (page: Page, days: number, clock: string) =>
  expect(streakRegion(page)).toMatchAriaSnapshot(`
    - paragraph: "${days}"
    - text: /${days <= 1 ? 'jour' : 'jours'} sans fumer ${clock}/
  `)
