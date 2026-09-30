import { expect, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { DAY, NOW } from './support/clock'
import { startNow } from './support/flows'
import { streakRegion, tap } from './support/locators'
import { sandboxAt, sandboxMarker } from './support/sandbox'

test('the panel is unreachable without the debug parameter', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(sandboxMarker(page)).toHaveCount(0)

  await page.goto(`/?clock=${NOW}`)
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(sandboxMarker(page)).toHaveCount(0)
})

test('the sandbox clock moves by an hour and a day, and the streak follows', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await sandboxMarker(page).click()
  // Day, date, hour and minutes, no seconds — the device's time zone sets the rest.
  await expect(page.getByRole('dialog').locator('time')).toHaveText(
    /^\S+ \d{1,2} \S+ 2026, \d\d:\d\d$/,
  )

  await tap(page, '+1 h')
  await expectStreak(page, 0, '01 h 00')
  await tap(page, '+1 j')
  await expectStreak(page, 1, '01 h 00')
  await tap(page, '−1 h')
  await expectStreak(page, 1, '00 h 00')
  await tap(page, '−1 j')
  await expectStreak(page, 0, '00 h 00')

  // Before the quit moment the streak waits at zero.
  await tap(page, '−1 h')
  await expectStreak(page, 0, '00 h 00')

  // Back on real time, the streak counts from the stopped instant to today.
  await tap(page, 'Revenir à l’heure réelle')
  const days = Math.floor((Date.now() - NOW) / DAY)
  await expectStreak(page, days, '\\d\\d h \\d\\d')
})

test('wiping the sandbox returns it to an empty journal', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')

  await sandboxMarker(page).click()
  await tap(page, 'Vider')

  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(streakRegion(page)).toHaveCount(0)
})

test('a sandbox session never reads nor writes the real journal', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')

  // The real quit moment is not read: the sandbox starts empty.
  await page.goto(sandboxAt(NOW))
  await expect(sandboxMarker(page)).toBeVisible()
  await startNow(page)
  await sandboxMarker(page).click()
  await tap(page, '+1 j')
  await expectStreak(page, 1, '00 h 00')

  // Nor written: back on the real journal, its quit moment is intact.
  await page.goto('/')
  await expect(sandboxMarker(page)).toHaveCount(0)
  await expectStreak(page, 0, '00 h 00')
})

// The installed PWA has no address bar: the sandbox opens and closes from inside the app.
test('a long press on the brand opens the sandbox, and the panel leaves it', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')

  await page.getByRole('heading', { name: 'quit' }).getByText('quit').hover()
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()

  await expect(sandboxMarker(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()

  await sandboxMarker(page).click()
  await tap(page, 'Sortir')

  await expect(sandboxMarker(page)).toHaveCount(0)
  await expectStreak(page, 0, '00 h 00')
})

test('a short tap on the brand does nothing', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'quit' }).getByText('quit').click()
  await page.waitForTimeout(1200)

  await expect(sandboxMarker(page)).toHaveCount(0)
})
