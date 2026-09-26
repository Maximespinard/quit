import { expect, type Page, test } from '@playwright/test'
import { expectStreak, localInput, sandboxAt, startNow, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)
const HOUR = 60 * 60 * 1000

// The tracer bullet on the sandbox clock: first launch → streak, to the second.
test('first launch sets the quit moment to now and the streak starts at zero', async ({ page }) => {
  await page.goto(sandboxAt(NOW))

  await startNow(page)

  await expectStreak(page, 0, '00:00:00')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('the quit moment survives a reload', async ({ page }) => {
  await page.goto('/')

  await startNow(page)
  await expect(streakRegion(page)).toBeVisible()

  await page.reload()

  // A second boundary may pass between the tap and the assertion.
  await expectStreak(page, 0, '00:00:\\d\\d')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const spendField = (page: Page) =>
  page.getByRole('textbox', { name: 'Combien tu dépensais en tabac par semaine ?' })
const baselineField = (page: Page) =>
  page.getByRole('textbox', { name: 'Combien de cigarettes par jour ?' })

test('the full first launch: a backdated quit moment, the spend, the baseline, the default protocol', async ({
  page,
}) => {
  await page.goto(sandboxAt(NOW))
  await expect(page.getByText('Étape 1 sur 4')).toBeVisible()

  // Two days and three hours before the sandbox clock, in the device's own time zone.
  await page.getByLabel('Une autre date et heure').fill(await localInput(page, NOW - 51 * HOUR))
  await tap(page, 'C’est depuis là')

  await expect(page.getByText('Étape 2 sur 4')).toBeVisible()
  await spendField(page).fill('-10')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toHaveText(
    'Indique un montant en euros, plus grand que zéro.',
  )
  await spendField(page).fill('abc')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toBeVisible()
  await spendField(page).fill('42,50')
  await tap(page, 'Continuer')

  await baselineField(page).fill('7,5')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toHaveText(
    'Indique un nombre entier de cigarettes, au moins une.',
  )
  // Back keeps what was already answered.
  await tap(page, 'Retour')
  await expect(spendField(page)).toHaveValue('42,50')
  await tap(page, 'Continuer')
  await baselineField(page).fill('12')
  await tap(page, 'Continuer')

  const protocol = page.getByRole('region', { name: 'Ton protocole de patchs' })
  await expect(protocol).toContainText('21 mg · 28 jours')
  await expect(protocol).toContainText('7 mg · 28 jours')
  await tap(page, 'C’est parti')

  await expectStreak(page, 2, '03:00:00')
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('every first-launch answer survives a reload', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await expect(streakRegion(page)).toBeVisible()

  await page.reload()
  await page.getByRole('link', { name: 'Réglages' }).click()

  await expect(page.getByRole('form', { name: 'Dépense en tabac par semaine' })).toContainText(
    '35,00 €',
  )
  await expect(page.getByRole('form', { name: 'Cigarettes par jour, avant' })).toContainText('15')
})
