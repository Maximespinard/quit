import { expect, type Page, test } from '@playwright/test'
import { streakRegion } from './sandbox'

// Proves the harness: the real bundle serves and the shell renders.
test('the app loads and shows its shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Quit' })).toBeVisible()
})

const sidewaysOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

test('neither the first-launch screen nor the streak scrolls sideways', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()
  expect(await sidewaysOverflow(page)).toBe(0)

  await page.getByRole('button', { name: 'Maintenant' }).click()
  await expect(streakRegion(page)).toBeVisible()
  expect(await sidewaysOverflow(page)).toBe(0)
})
