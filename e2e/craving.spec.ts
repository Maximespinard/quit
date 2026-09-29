import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, startNow } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const timer = (page: Page) => page.getByRole('timer', { name: 'Temps restant' })
const recordedNotice = (page: Page) => page.getByRole('status').filter({ hasText: 'Envie notée.' })

const rateAndRecord = async (page: Page, intensity: string) => {
  await tap(page, intensity)
  await tap(page, 'Enregistrer l’envie')
}

/** A sandbox with a quit moment, its clock stopped on `NOW`. */
const homeWithStreak = async (page: Page) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')
}

test('a craving held to the end is celebrated, rated and recorded', async ({ page }) => {
  await homeWithStreak(page)

  // One tap, nothing asked first.
  await tap(page, 'Envie')
  await expect(timer(page)).toHaveText('4:00')
  await expect(page.getByRole('group', { name: 'Intensité de l’envie' })).toHaveCount(0)

  // The sandbox clock jumps past the timer's duration.
  await tap(page, 'Bac à sable')
  await tap(page, '+1 h')
  await tap(page, 'Fermer')

  await expect(page.getByRole('heading', { name: 'Tu as tenu jusqu’au bout.' })).toBeVisible()
  await rateAndRecord(page, '3')

  await expect(recordedNotice(page)).toBeVisible()
  await expectStreak(page, 0, '01 h 00')
})

test('a craving stopped early is still recorded, without the celebration', async ({ page }) => {
  await homeWithStreak(page)
  await tap(page, 'Envie')

  await tap(page, 'Arrêter')

  await expect(page.getByRole('heading', { name: 'Minuteur arrêté.' })).toBeVisible()
  await rateAndRecord(page, '1')
  await expect(recordedNotice(page)).toBeVisible()
})

test('a past craving is logged without the timer', async ({ page }) => {
  await homeWithStreak(page)

  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await page.getByLabel('Date et heure').fill('2026-01-01T09:30')
  await rateAndRecord(page, '2')

  await expect(recordedNotice(page)).toBeVisible()
})

// Real clock: the remaining time derives from the start in the url, not from a running timer.
test('a reload mid-timer keeps counting from the start instant', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await tap(page, 'Envie')
  await expect(timer(page)).toBeVisible()

  await page.waitForTimeout(2_000)
  await page.reload()

  await expect(timer(page)).toHaveText(/^3:5\d$/)
})

/** The cravings as stored on the device: no screen lists their tags yet. */
const storedCravingTags = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<unknown>((resolve, reject) => {
        const request = indexedDB.open('quit')
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const read = request.result.transaction('journal').objectStore('journal').get('current')
          read.onerror = () => reject(read.error)
          read.onsuccess = () => {
            const facts = (read.result as { facts: { type: string; tags?: string[] }[] }).facts
            resolve(facts.filter((fact) => fact.type === 'craving').map((fact) => fact.tags))
            request.result.close()
          }
        }
      }),
  )

// Real journal: the typed tag must come back from IndexedDB after a reload.
test('a craving is tagged, and the typed tag is offered again on the next one', async ({
  page,
}) => {
  await page.goto('/')
  await startNow(page)

  await tap(page, 'Envie')
  await tap(page, 'Arrêter')
  await expect(page.getByRole('group', { name: 'La situation' })).toHaveCount(0)
  await tap(page, '2')
  await tap(page, 'Café')
  await page.getByLabel('Une autre situation').fill('Voiture')
  await tap(page, 'Ajouter')
  await tap(page, 'Enregistrer l’envie')
  await expect(recordedNotice(page)).toBeVisible()

  expect(await storedCravingTags(page)).toEqual([['coffee', 'Voiture']])

  await page.reload()
  await tap(page, 'Envie')
  await tap(page, 'Arrêter')
  await tap(page, '1')
  await expect(page.getByRole('button', { name: 'Voiture', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  )

  // Closing without a tag is the one tap it always was.
  await tap(page, 'Enregistrer l’envie')
  await expect(recordedNotice(page)).toBeVisible()
  expect(await storedCravingTags(page)).toEqual([['coffee', 'Voiture'], []])

  // Words typed but never added still count once the craving is recorded.
  await tap(page, 'Envie')
  await tap(page, 'Arrêter')
  await tap(page, '3')
  await page.getByLabel('Une autre situation').fill('Métro')
  await tap(page, 'Enregistrer l’envie')
  await expect(recordedNotice(page)).toBeVisible()
  expect(await storedCravingTags(page)).toEqual([['coffee', 'Voiture'], [], ['Métro']])
})

/** The animation each blob of the timer haze plays, as the browser computed it. */
const hazeAnimations = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[data-haze] > *')].map(
      (blob) => getComputedStyle(blob).animationName,
    ),
  )

test('the timer haze drifts only when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await homeWithStreak(page)
  await tap(page, 'Envie')
  await expect(timer(page)).toBeVisible()

  expect(await hazeAnimations(page)).toEqual([
    'haze-drift-a',
    'haze-drift-b',
    'haze-drift-a',
    'haze-drift-b',
  ])

  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await hazeAnimations(page)).toEqual(['none', 'none', 'none', 'none'])
})
