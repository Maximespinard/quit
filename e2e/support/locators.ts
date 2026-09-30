import type { Page } from '@playwright/test'

/** A button by its name: a string matches it whole, a regex as written. */
export const button = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' })

export const tap = (page: Page, name: string | RegExp) => button(page, name).click()

/** A history row, a link whose name matches `name`. */
export const rows = (page: Page, name: RegExp) => page.getByRole('link', { name })

// Home.
export const streakRegion = (page: Page) =>
  page.getByRole('region', { name: 'Streak', exact: true })
export const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
export const protocolSummary = (page: Page) => page.getByRole('region', { name: 'Protocole' })
export const patchCard = (page: Page) => page.getByRole('region', { name: 'Patch du jour' })

// Cravings: the launcher pill on every screen outside the forms, and the timer it starts.
export const cravingLauncher = (page: Page) => button(page, 'Envie')
export const cravingTimer = (page: Page) => page.getByRole('timer', { name: 'Temps restant' })

// First launch asks its questions; settings name the same values otherwise.
export const firstLaunchSpendField = (page: Page) =>
  page.getByRole('textbox', { name: 'Combien tu dépensais en tabac par semaine ?' })
export const firstLaunchBaselineField = (page: Page) =>
  page.getByRole('textbox', { name: 'Combien de cigarettes par jour ?' })
export const settingsSpendField = (page: Page) =>
  page.getByRole('textbox', { name: 'Dépense en tabac par semaine' })
export const settingsBaselineField = (page: Page) =>
  page.getByRole('textbox', { name: 'Cigarettes par jour, avant' })
