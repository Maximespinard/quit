import { expect, type Page, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { sandboxWith, shiftClock } from './support/sandbox'

declare global {
  interface Window {
    heroFrames: string[]
  }
}

/**
 * Records every value the hero shows, as painted: the visible figures only (the screen-reader
 * copy always holds the final values). Installed before the app boots, so a cold load's very
 * first frame is caught.
 */
const recordHeroFrames = (page: Page) =>
  page.addInitScript(() => {
    window.heroFrames = []
    const record = () => {
      const hero = document.querySelector('section[aria-label="Streak"]')
      if (!hero) return
      const frame = [...hero.querySelectorAll('[aria-hidden="true"]')]
        .map((figure) => figure.textContent)
        .filter((text) => text !== '')
        .join(' ')
        // The clock's no-break spaces read as plain ones.
        .replace(/\s+/g, ' ')
      if (window.heroFrames.at(-1) !== frame) window.heroFrames.push(frame)
    }
    new MutationObserver(record).observe(document, {
      childList: true,
      characterData: true,
      subtree: true,
    })
  })

/** The frames painted since the last call. */
const takeFrames = (page: Page) =>
  page.evaluate(() => window.heroFrames.splice(0, window.heroFrames.length))

test('the streak counts up once per app launch, never on the way back home', async ({ page }) => {
  await recordHeroFrames(page)

  // Cold load: days and clock count up together from zero.
  await page.goto(sandboxWith('day-45-lapse'))
  await expectStreak(page, 44, '02 h 00')
  await expect.poll(() => page.evaluate(() => window.heroFrames.at(-1))).toBe('44 02 h 00')
  const entrance = await takeFrames(page)
  expect(entrance[0]).toBe('0 00 h 00')
  expect(entrance.length).toBeGreaterThan(2)

  // Home → settings → the in-app way back: final values straight away.
  await page.getByRole('link', { name: 'Réglages' }).click()
  await page.getByRole('link', { name: 'Retour' }).click()
  await expectStreak(page, 44, '02 h 00')
  expect(await takeFrames(page)).toEqual(['44 02 h 00'])

  // Home → settings → the browser's back button: the same.
  await page.getByRole('link', { name: 'Réglages' }).click()
  await page.goBack()
  await expectStreak(page, 44, '02 h 00')
  expect(await takeFrames(page)).toEqual(['44 02 h 00'])

  // A sandbox clock shift moves the figures, it does not replay the count.
  await shiftClock(page, '+1 h')
  await expectStreak(page, 44, '03 h 00')
  expect(await takeFrames(page)).not.toContainEqual(expect.stringMatching(/^0 /))

  // A full reload is a new launch: the count plays again.
  await page.reload()
  await expect.poll(() => page.evaluate(() => window.heroFrames[0])).toBe('0 00 h 00')
})
