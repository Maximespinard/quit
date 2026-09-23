import { expect, test } from '@playwright/test'
import { expectStreak, sandboxAt, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

// The tracer bullet on the sandbox clock: first launch → streak, to the second.
test('first launch sets the quit moment to now and the streak starts at zero', async ({ page }) => {
  await page.goto(sandboxAt(NOW))

  await page.getByRole('button', { name: 'Maintenant' }).click()

  await expectStreak(page, 0, '00:00:00')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('the quit moment survives a reload', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Maintenant' }).click()
  await expect(streakRegion(page)).toBeVisible()

  await page.reload()

  // A second boundary may pass between the tap and the assertion.
  await expectStreak(page, 0, '00:00:\\d\\d')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})
