import { expect, type Page } from '@playwright/test'
import { streakRegion } from './locators'

/**
 * The streak as a screen reader gets it: whole days, then the label and the `hh h mm` clock.
 * `clock` is a regex source, so a still-running real clock can be matched with `\d\d`; its
 * spaces match the no-break spaces the app writes.
 */
export const expectStreak = (page: Page, days: number, clock: string) =>
  expect(streakRegion(page)).toMatchAriaSnapshot(`
    - paragraph: "${days}"
    - text: /${days <= 1 ? 'jour' : 'jours'} de streak ${clock.replaceAll(' ', '\\s')}/
  `)
