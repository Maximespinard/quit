import { expect, test } from '@playwright/test'

// Proves the harness: the real bundle serves and the shell renders.
test('the app loads and shows its shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Quit' })).toBeVisible()
})

test('nothing scrolls sideways at iPhone width', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)
})
