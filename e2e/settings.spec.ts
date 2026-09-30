import { expect, type Page, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { DAY, HOUR, localInput, NOW } from './support/clock'
import { openSettings, startNow } from './support/flows'
import {
  firstLaunchBaselineField,
  firstLaunchSpendField,
  settingsBaselineField,
  settingsSpendField,
  streakRegion,
  tap,
} from './support/locators'
import { sandboxAt } from './support/sandbox'

const quitMomentField = (page: Page) => page.getByLabel('Moment de l’arrêt')
const saveButton = (page: Page) => page.getByRole('button', { name: 'Enregistrer', exact: true })

test('first launch, then the weekly spend edited in settings', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')
  await openSettings(page)

  // One save for the whole screen, asleep until a value changes.
  await expect(settingsSpendField(page)).toHaveValue('35')
  await expect(saveButton(page)).toBeDisabled()
  await settingsSpendField(page).fill('-5')
  await saveButton(page).click()
  await expect(settingsSpendField(page)).toHaveAccessibleDescription(
    'Indique un montant en euros, plus grand que zéro.',
  )

  // Saved: home is the acknowledgement, and still the sandbox.
  await settingsSpendField(page).fill('48,90')
  await saveButton(page).click()
  await expectStreak(page, 0, '00 h 00')
  await expect(page).toHaveURL(new RegExp(`debug=true.*clock=${NOW}`))

  // The new value is the journal's, not the form's.
  await openSettings(page)
  await expect(settingsSpendField(page)).toHaveValue('48,90')
})

test('the quit moment moves earlier, and the streak follows at once', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await openSettings(page)

  await quitMomentField(page).fill(await localInput(page, NOW - 3 * DAY))
  await saveButton(page).click()

  await expectStreak(page, 3, '00 h 00')
})

test('the quit moment cannot move later than a fact already recorded', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByLabel('Une autre date et heure').fill(await localInput(page, NOW - 2 * DAY))
  await tap(page, 'C’est depuis là')
  await firstLaunchSpendField(page).fill('35')
  await tap(page, 'Continuer')
  await firstLaunchBaselineField(page).fill('15')
  await tap(page, 'Continuer')
  await tap(page, 'C’est parti')

  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await page.getByLabel('Date et heure').fill(await localInput(page, NOW - DAY))
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')
  await openSettings(page)

  await quitMomentField(page).fill(await localInput(page, NOW - HOUR))
  await saveButton(page).click()

  await expect(page.getByRole('alert')).toContainText('Ton arrêt ne peut pas venir après.')
  await expect(quitMomentField(page)).toHaveAttribute('aria-invalid', 'true')
  await page.getByRole('link', { name: 'Retour' }).click()
  await expectStreak(page, 2, '00 h 00')
})

test('settings open the protocol editor', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await openSettings(page)

  await page.getByRole('link', { name: /Modifier le protocole/ }).click()

  await expect(page.getByRole('heading', { name: 'Protocole' })).toBeVisible()
  await expect(streakRegion(page)).toHaveCount(0)
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('a spend and a baseline edited in settings survive a reload', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await openSettings(page)

  await settingsSpendField(page).fill('35,5')
  await settingsBaselineField(page).fill('20')
  await saveButton(page).click()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toHaveCount(0)

  await page.reload()
  await openSettings(page)

  // Stored as 3550 cents, shown back as it is kept: nothing left to save.
  await expect(settingsSpendField(page)).toHaveValue('35,50')
  await expect(settingsBaselineField(page)).toHaveValue('20')
  await expect(saveButton(page)).toBeDisabled()
})

test('settings before first launch lead back to it', async ({ page }) => {
  await page.goto(sandboxAt(NOW, '/settings'))

  await expect(page.getByRole('button', { name: 'Maintenant', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toHaveCount(0)
})
