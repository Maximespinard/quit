import { expect, test } from '@playwright/test'

// The tracer bullet, end to end against real IndexedDB: first launch → streak → reload → still there.
test('first launch sets the quit moment to now and the streak survives a reload', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Maintenant' }).click()

  const streak = page.getByRole('region', { name: 'jours sans fumer' })
  await expect(streak).toBeVisible()
  // A minute boundary may pass between the tap and the assertion.
  await expect(streak).toContainText(/00 h 0[01]/)

  await page.reload()

  await expect(streak).toBeVisible()
  await expect(streak).toContainText(/00 h 0[01]/)
  await expect(page.getByRole('button', { name: 'Maintenant' })).toHaveCount(0)
})
