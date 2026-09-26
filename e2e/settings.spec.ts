import { expect, type Page, test } from '@playwright/test'
import { expectStreak, localInput, sandboxAt, startNow, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const setting = (page: Page, name: string) => page.getByRole('form', { name })
const spendSetting = (page: Page) => setting(page, 'Dépense en tabac par semaine')
const quitMomentSetting = (page: Page) => setting(page, 'Moment de l’arrêt')

async function openSettings(page: Page) {
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toBeVisible()
}

test('first launch, then the weekly spend edited in settings', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00:00:00')
  await openSettings(page)

  await expect(spendSetting(page).getByRole('textbox')).toHaveValue('35')
  await spendSetting(page).getByRole('textbox').fill('-5')
  await spendSetting(page).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(spendSetting(page).getByRole('alert')).toHaveText(
    'Indique un montant en euros, plus grand que zéro.',
  )

  await spendSetting(page).getByRole('textbox').fill('48,90')
  await spendSetting(page).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(spendSetting(page).getByRole('status')).toHaveText('Enregistré.')

  // Still the sandbox, and the new value is the journal's, not the form's.
  await page.getByRole('link', { name: 'Retour' }).click()
  await expect(page).toHaveURL(new RegExp(`debug=true.*clock=${NOW}`))
  await openSettings(page)
  await expect(spendSetting(page).getByRole('textbox')).toHaveValue('48,90')
})

test('the quit moment moves earlier, and the streak follows at once', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await openSettings(page)

  await quitMomentSetting(page)
    .locator('input')
    .fill(await localInput(page, NOW - 3 * DAY))
  await quitMomentSetting(page).getByRole('button', { name: 'Enregistrer' }).click()
  await expect(quitMomentSetting(page).getByRole('status')).toHaveText('Enregistré.')

  await page.getByRole('link', { name: 'Retour' }).click()
  await expectStreak(page, 3, '00:00:00')
})

test('the quit moment cannot move later than a fact already recorded', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByLabel('Une autre date et heure').fill(await localInput(page, NOW - 2 * DAY))
  await tap(page, 'C’est depuis là')
  await page
    .getByRole('textbox', { name: 'Combien tu dépensais en tabac par semaine ?' })
    .fill('35')
  await tap(page, 'Continuer')
  await page.getByRole('textbox', { name: 'Combien de cigarettes par jour ?' }).fill('15')
  await tap(page, 'Continuer')
  await tap(page, 'C’est parti')

  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await page.getByLabel('Date et heure').fill(await localInput(page, NOW - DAY))
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')
  await openSettings(page)

  await quitMomentSetting(page)
    .locator('input')
    .fill(await localInput(page, NOW - HOUR))
  await quitMomentSetting(page).getByRole('button', { name: 'Enregistrer' }).click()

  await expect(quitMomentSetting(page).getByRole('alert')).toContainText(
    'Ton arrêt ne peut pas venir après.',
  )
  await page.getByRole('link', { name: 'Retour' }).click()
  await expectStreak(page, 2, '00:00:00')
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

  await spendSetting(page).getByRole('textbox').fill('35,5')
  await spendSetting(page).getByRole('button', { name: 'Enregistrer' }).click()
  // Stored as 3550 cents, shown back as it is kept: nothing left to save.
  await expect(spendSetting(page).getByRole('textbox')).toHaveValue('35,50')
  await expect(spendSetting(page).getByRole('button', { name: 'Enregistrer' })).toBeDisabled()
  const baseline = setting(page, 'Cigarettes par jour, avant')
  await baseline.getByRole('textbox').fill('20')
  await baseline.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(baseline.getByRole('status')).toHaveText('Enregistré.')

  await page.reload()

  await expect(spendSetting(page).getByRole('textbox')).toHaveValue('35,50')
  await expect(baseline.getByRole('textbox')).toHaveValue('20')
})

test('settings before first launch lead back to it', async ({ page }) => {
  await page.goto(`/settings?debug=true&clock=${NOW}`)

  await expect(page.getByRole('button', { name: 'Maintenant', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toHaveCount(0)
})
