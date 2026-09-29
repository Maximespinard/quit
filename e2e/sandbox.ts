import { expect, type Page } from '@playwright/test'

/** The home screen in the sandbox, its clock stopped on `at`: time is deterministic. */
export const sandboxAt = (at: number) => `/?debug=true&clock=${at}`

export const streakRegion = (page: Page) =>
  page.getByRole('region', { name: 'Streak', exact: true })

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

/** First launch the quickest way: quit now, a weekly spend, a baseline, the default protocol. */
export async function startNow(page: Page) {
  await page.getByRole('button', { name: 'Maintenant', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Combien tu dépensais en tabac par semaine ?' })
    .fill('35')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('textbox', { name: 'Combien de cigarettes par jour ?' }).fill('15')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: 'C’est parti' }).click()
}

/** An instant as the page's `datetime-local` field takes it, in the browser's own time zone. */
export const localInput = (page: Page, at: number) =>
  page.evaluate((ms) => {
    const d = new Date(ms)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }, at)

/** The home screen in a sandbox seeded from a scenario, its clock stopped on the scenario's. */
export const sandboxWith = (scenario: string) => `/?debug=true&scenario=${scenario}`

/** Moves the sandbox clock by the debug panel's `shift` button, `times` times over. */
export async function shiftClock(page: Page, shift: string, times = 1) {
  const tap = (name: string) => page.getByRole('button', { name, exact: true }).click()
  await tap('Bac à sable')
  for (let i = 0; i < times; i += 1) await tap(shift)
  await tap('Fermer')
}
