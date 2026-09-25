import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt } from './sandbox'

// "Today" is the local calendar day: the timezone is pinned so the times below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

/** 13:00 in Paris. */
const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' }).click()
const patchCard = (page: Page) => page.getByRole('region', { name: 'Patch du jour' })

const shiftClock = async (page: Page, shift: string) => {
  await tap(page, 'Bac à sable')
  await tap(page, shift)
  await tap(page, 'Fermer')
}

/** A sandbox with a quit moment, its clock stopped on `NOW`. */
const homeWithStreak = async (page: Page) => {
  await page.goto(sandboxAt(NOW))
  await tap(page, 'Maintenant')
  await expectStreak(page, 0, '00:00:00')
}

test('one tap logs today’s patch, and the next day asks again', async ({ page }) => {
  await homeWithStreak(page)
  await expect(patchCard(page)).toContainText('Pas encore posé aujourd’hui.')

  await tap(page, /^Poser le patch · 21\smg$/)

  await expect(patchCard(page)).toContainText('Posé aujourd’hui')
  await expect(patchCard(page)).toContainText(/à 13:00 · 21\smg/)
  await expect(page.getByRole('button', { name: /^Poser le patch/ })).toHaveCount(0)

  await shiftClock(page, '+1 j')

  await expect(patchCard(page)).toContainText('Pas encore posé aujourd’hui.')
  await expect(page.getByRole('button', { name: /^Poser le patch · 21\smg$/ })).toBeVisible()
})

test('a missed day is caught up and a dose overridden for one patch only', async ({ page }) => {
  await homeWithStreak(page)
  await shiftClock(page, '+1 j')

  // Catch up yesterday evening: today stays to log.
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await page.getByLabel('Date et heure').fill('2026-01-01T20:00')
  await tap(page, 'Enregistrer le patch')

  await expect(page.getByRole('status').filter({ hasText: 'Patch noté.' })).toBeVisible()
  await expect(patchCard(page)).toContainText('Pas encore posé aujourd’hui.')

  // Today, a cut patch: the dose differs, the protocol does not.
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await expect(page.getByLabel('Dose (mg)')).toHaveValue('21')
  await page.getByLabel('Dose (mg)').fill('10,5')
  await tap(page, 'Enregistrer le patch')

  await expect(patchCard(page)).toContainText(/à 13:00 · 10,5\smg/)
  await expect(page.getByRole('region', { name: 'Protocole' })).toContainText(/21\smg/)
})

test('a patch before the quit moment or in the future is refused', async ({ page }) => {
  await homeWithStreak(page)
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()

  await page.getByLabel('Date et heure').fill('2026-01-01T09:00')
  await tap(page, 'Enregistrer le patch')
  await expect(page.getByRole('alert')).toHaveText(
    'C’est avant ton arrêt : le protocole n’avait pas commencé.',
  )

  await page.getByLabel('Date et heure').fill('2026-01-02T09:00')
  await tap(page, 'Enregistrer le patch')
  await expect(page.getByRole('alert')).toHaveText('Ce moment n’est pas encore arrivé.')
})
