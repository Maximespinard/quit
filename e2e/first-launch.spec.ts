import { expect, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { HOUR, localInput, NOW } from './support/clock'
import { startNow } from './support/flows'
import {
  firstLaunchBaselineField,
  firstLaunchSpendField,
  settingsBaselineField,
  settingsSpendField,
  streakRegion,
  tap,
} from './support/locators'
import { sandboxAt } from './support/sandbox'

// The tracer bullet on the sandbox clock: first launch → streak, to the second.
test('first launch sets the quit moment to now and the streak starts at zero', async ({ page }) => {
  await page.goto(sandboxAt(NOW))

  await startNow(page)

  await expectStreak(page, 0, '00 h 00')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('the quit moment survives a reload', async ({ page }) => {
  await page.goto('/')

  await startNow(page)
  await expect(streakRegion(page)).toBeVisible()

  await page.reload()

  // A second boundary may pass between the tap and the assertion.
  await expectStreak(page, 0, '00 h 00')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})

test('the full first launch: a backdated quit moment, the spend, the baseline, the default protocol', async ({
  page,
}) => {
  await page.goto(sandboxAt(NOW))
  await expect(page.getByText('Étape 1 sur 4')).toBeVisible()

  // Two days and three hours before the sandbox clock, in the device's own time zone.
  await page.getByLabel('Une autre date et heure').fill(await localInput(page, NOW - 51 * HOUR))
  await tap(page, 'C’est depuis là')

  await expect(page.getByText('Étape 2 sur 4')).toBeVisible()
  await firstLaunchSpendField(page).fill('-10')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toHaveText(
    'Indique un montant en euros, plus grand que zéro.',
  )
  await firstLaunchSpendField(page).fill('abc')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toBeVisible()
  await firstLaunchSpendField(page).fill('42,50')
  await tap(page, 'Continuer')

  await firstLaunchBaselineField(page).fill('7,5')
  await tap(page, 'Continuer')
  await expect(page.getByRole('alert')).toHaveText(
    'Indique un nombre entier de cigarettes, au moins une.',
  )
  // Back keeps what was already answered, the backdated moment included.
  await tap(page, 'Retour')
  await expect(firstLaunchSpendField(page)).toHaveValue('42,50')
  await tap(page, 'Retour')
  await expect(page.getByLabel('Une autre date et heure')).toHaveValue(
    await localInput(page, NOW - 51 * HOUR),
  )
  await tap(page, 'C’est depuis là')
  await tap(page, 'Continuer')
  await firstLaunchBaselineField(page).fill('12')
  await tap(page, 'Continuer')

  const protocol = page.getByRole('region', { name: 'Ton protocole de patchs' })
  await expect(protocol).toContainText('21 mg · 28 jours')
  await expect(protocol).toContainText('7 mg · 28 jours')
  await tap(page, 'C’est parti')

  await expectStreak(page, 2, '03 h 00')
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('every first-launch answer survives a reload', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await expect(streakRegion(page)).toBeVisible()

  await page.reload()
  await page.getByRole('link', { name: 'Réglages' }).click()

  await expect(settingsSpendField(page)).toHaveValue('35')
  await expect(settingsBaselineField(page)).toHaveValue('15')
})
