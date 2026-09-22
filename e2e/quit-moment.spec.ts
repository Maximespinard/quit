import { expect, test } from '@playwright/test'

// The tracer bullet, end to end against real IndexedDB: first launch → streak → reload → still there.
test('first launch sets the quit moment to now and the streak survives a reload', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Maintenant' }).click()

  const streak = page.getByRole('region', { name: 'Temps sans fumer' })
  await expect(streak).toBeVisible()
  // A second boundary may pass between the tap and the assertion.
  await expect(streak).toContainText(/00:00:\d\d/)

  await page.reload()

  await expect(streak).toBeVisible()
  await expect(streak).toContainText(/00:00:\d\d/)
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})
