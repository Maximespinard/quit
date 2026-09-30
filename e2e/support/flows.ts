import { expect, type Page } from '@playwright/test'
import { expectStreak } from './assertions'
import { NOW } from './clock'
import { firstLaunchBaselineField, firstLaunchSpendField, tap } from './locators'
import { daysLater, sandboxAt } from './sandbox'

/** First launch the quickest way: quit now, a weekly spend, a baseline, the default protocol. */
export async function startNow(page: Page) {
  await tap(page, 'Maintenant')
  await firstLaunchSpendField(page).fill('35')
  await tap(page, 'Continuer')
  await firstLaunchBaselineField(page).fill('15')
  await tap(page, 'Continuer')
  await tap(page, 'C’est parti')
}

/** A sandbox whose quit moment is `NOW`, its clock then moved `days` on. */
export async function daysIn(page: Page, days: number) {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  if (days > 0) await daysLater(page, days)
  await expectStreak(page, days, '00 h 00')
}

/** A sandbox with a quit moment, its clock stopped on `NOW`. */
export const homeWithStreak = (page: Page) => daysIn(page, 0)

/** Declares a lapse from home, at the current time, and waits for its confirmation. */
export async function declareLapse(page: Page) {
  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await expect(page.getByRole('heading', { name: 'Tu as fumé ?' })).toBeVisible()
  await tap(page, 'Oui, noter')
  await expect(page.getByRole('status').filter({ hasText: 'C’est noté.' })).toBeVisible()
}

export async function openSettings(page: Page) {
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toBeVisible()
}
