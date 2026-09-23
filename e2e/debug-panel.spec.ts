import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)
const DAY_MS = 24 * 60 * 60 * 1000

const marker = (page: Page) => page.getByRole('button', { name: 'Bac à sable' })
const tap = (page: Page, name: string) => page.getByRole('button', { name }).click()

test('the panel is unreachable without the debug parameter', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(marker(page)).toHaveCount(0)

  await page.goto(`/?clock=${NOW}`)
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(marker(page)).toHaveCount(0)
})

test('the sandbox clock moves by an hour and a day, and the streak follows', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await tap(page, 'Maintenant')
  await marker(page).click()

  await tap(page, '+1 h')
  await expectStreak(page, 0, '01:00:00')
  await tap(page, '+1 j')
  await expectStreak(page, 1, '01:00:00')
  await tap(page, '−1 h')
  await expectStreak(page, 1, '00:00:00')
  await tap(page, '−1 j')
  await expectStreak(page, 0, '00:00:00')

  // Before the quit moment the streak waits at zero.
  await tap(page, '−1 h')
  await expectStreak(page, 0, '00:00:00')

  // Back on real time, the streak counts from the stopped instant to today.
  await tap(page, 'Revenir à l’heure réelle')
  const days = Math.floor((Date.now() - NOW) / DAY_MS)
  await expectStreak(page, days, '\\d\\d:\\d\\d:\\d\\d')
})

test('wiping the sandbox returns it to an empty journal', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await tap(page, 'Maintenant')
  await expectStreak(page, 0, '00:00:00')

  await marker(page).click()
  await tap(page, 'Vider le bac à sable')

  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  await expect(streakRegion(page)).toHaveCount(0)
})

test('a sandbox session never reads nor writes the real journal', async ({ page }) => {
  await page.goto('/')
  await tap(page, 'Maintenant')
  await expectStreak(page, 0, '00:00:\\d\\d')

  // The real quit moment is not read: the sandbox starts empty.
  await page.goto(sandboxAt(NOW))
  await expect(marker(page)).toBeVisible()
  await tap(page, 'Maintenant')
  await marker(page).click()
  await tap(page, '+1 j')
  await expectStreak(page, 1, '00:00:00')

  // Nor written: back on the real journal, its quit moment is intact.
  await page.goto('/')
  await expect(marker(page)).toHaveCount(0)
  await expectStreak(page, 0, '00:00:\\d\\d')
})

// The installed PWA has no address bar: the sandbox opens and closes from inside the app.
test('a long press on the brand opens the sandbox, and the panel leaves it', async ({ page }) => {
  await page.goto('/')
  await tap(page, 'Maintenant')
  await expectStreak(page, 0, '00:00:\\d\\d')

  await page.getByRole('heading', { name: 'quit' }).getByText('quit').hover()
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()

  await expect(marker(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()

  await marker(page).click()
  await tap(page, 'Quitter le bac à sable')

  await expect(marker(page)).toHaveCount(0)
  await expectStreak(page, 0, '00:00:\\d\\d')
})

test('a short tap on the brand does nothing', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'quit' }).getByText('quit').click()
  await page.waitForTimeout(1200)

  await expect(marker(page)).toHaveCount(0)
})
