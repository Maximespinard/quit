import { expect, type Page, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { homeWithStreak, startNow } from './support/flows'
import { cravingLauncher, cravingTimer, tap } from './support/locators'
import { shiftClock } from './support/sandbox'

const recordedNotice = (page: Page) => page.getByRole('status').filter({ hasText: 'Envie notée.' })

const rateAndRecord = async (page: Page, intensity: string) => {
  await tap(page, intensity)
  await tap(page, 'Enregistrer l’envie')
}

test('a craving held to the end is celebrated, rated and recorded', async ({ page }) => {
  await homeWithStreak(page)

  // One tap, nothing asked first.
  await tap(page, 'Envie')
  await expect(cravingTimer(page)).toHaveText('4:00')
  await expect(page.getByRole('group', { name: 'Intensité de l’envie' })).toHaveCount(0)

  // The sandbox clock jumps past the timer's duration.
  await shiftClock(page, '+1 h')

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

// Envie and `Arrêter` share the bottom band: the second tap of a stressed double tap lands on
// `Arrêter`, which waits a beat before it answers.
test('a double tap on Envie leaves the timer running', async ({ page }) => {
  await homeWithStreak(page)
  const launcher = await cravingLauncher(page).boundingBox()
  if (launcher === null) throw new Error('Envie is not on screen')

  const x = launcher.x + launcher.width / 2
  const y = launcher.y + launcher.height / 2

  // Two thumb taps a stressed beat apart, the second one on the timer screen.
  await page.touchscreen.tap(x, y)
  await page.waitForTimeout(150)
  await page.touchscreen.tap(x, y)

  await expect(cravingTimer(page)).toHaveText('4:00')
  await page.waitForTimeout(1_000)
  await expect(cravingTimer(page)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Minuteur arrêté.' })).toHaveCount(0)

  // Once in, `Arrêter` stops the timer as before.
  await tap(page, 'Arrêter')
  await expect(page.getByRole('heading', { name: 'Minuteur arrêté.' })).toBeVisible()
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
  await expect(cravingTimer(page)).toBeVisible()

  await page.waitForTimeout(2_000)
  await page.reload()

  await expect(cravingTimer(page)).toHaveText(/^3:5\d$/)
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

// Real journal: the craving started away from home must land in IndexedDB like any other.
test('a craving started from the calendar runs and records like one started from home', async ({
  page,
}) => {
  await page.goto('/')
  await startNow(page)
  await page.getByRole('link', { name: 'Calendrier' }).click()
  await expect(page.getByRole('heading', { name: 'Calendrier' })).toBeVisible()

  await tap(page, 'Envie')
  await expect(cravingTimer(page)).toBeVisible()
  await tap(page, 'Arrêter')
  await rateAndRecord(page, '2')

  await expect(recordedNotice(page)).toBeVisible()
  expect(await storedCravingTags(page)).toEqual([[]])
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
  await expect(cravingTimer(page)).toBeVisible()

  expect(await hazeAnimations(page)).toEqual([
    'haze-drift-a',
    'haze-drift-b',
    'haze-drift-a',
    'haze-drift-b',
  ])

  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await hazeAnimations(page)).toEqual(['none', 'none', 'none', 'none'])
})

/** The animation `Arrêter`'s band plays, as the browser computed it. */
const stopBandAnimation = (page: Page) =>
  page
    .getByRole('button', { name: 'Arrêter', exact: true })
    .evaluate((stop) =>
      stop.parentElement ? getComputedStyle(stop.parentElement).animationName : null,
    )

/** `Arrêter`'s band opacity with its fade frozen `at` ms after the timer mounts. */
const stopBandOpacityAt = (page: Page, at: number) =>
  page.getByRole('button', { name: 'Arrêter', exact: true }).evaluate((stop, ms) => {
    const band = stop.parentElement
    const fade = band?.getAnimations()[0]
    if (!band || !fade) return null
    fade.pause()
    fade.currentTime = ms
    return Number(getComputedStyle(band).opacity)
  }, at)

test('Arrêter fades in only when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await homeWithStreak(page)
  await tap(page, 'Envie')

  expect(await stopBandAnimation(page)).toBe('fade-in')
  expect(await stopBandOpacityAt(page, 400)).toBe(0)
  const midFade = await stopBandOpacityAt(page, 600)
  expect(midFade).toBeGreaterThan(0)
  expect(midFade).toBeLessThan(1)
  expect(await stopBandOpacityAt(page, 800)).toBe(1)

  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await stopBandAnimation(page)).toBe('none')
  // The wait itself, reduced motion included, is the component test's (tests run reduced).
  await tap(page, 'Arrêter')
  await expect(page.getByRole('heading', { name: 'Minuteur arrêté.' })).toBeVisible()
})
