import { expect, type Page, test } from '@playwright/test'
import { expectStreak } from './support/assertions'
import { DAY, localInput, NOW } from './support/clock'
import { daysIn, declareLapse } from './support/flows'
import { protocolSummary, tap, totals } from './support/locators'
import { daysLater } from './support/sandbox'

const expectSmokeFreeDays = (page: Page, days: number) =>
  expect(totals(page).getByRole('definition').first()).toHaveText(String(days))

test('a slip keeps the streak running and costs its smoke-free day', async ({ page }) => {
  // Quit mid-day on day 1, now mid-day on day 4: days 2 and 3 are whole and over.
  await daysIn(page, 3)
  await expect(totals(page)).toHaveCount(0)
  await expect(protocolSummary(page)).toContainText('Jour 4 sur 28')

  await declareLapse(page)

  await expectStreak(page, 3, '00 h 00')
  await expect(page.getByText('Dernière cigarette il y a moins d’une minute.')).toBeVisible()
  await expect(page.getByText('Un jour avec un écart.', { exact: false })).toBeVisible()
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
  await expect(protocolSummary(page)).toContainText('Jour 4 sur 28')

  // Day 4 is over: it held the lapse, so the total stays at 2 instead of 3.
  await daysLater(page, 1)
  await expectStreak(page, 4, '00 h 00')
  await expectSmokeFreeDays(page, 2)
  await expect(page.getByText('Dernière cigarette il y a 1 j 0 h.')).toBeVisible()
})

test('three lapse days in a row are a relapse, announced before it lands', async ({ page }) => {
  await daysIn(page, 5)

  await declareLapse(page)
  await expectSmokeFreeDays(page, 4)
  await daysLater(page, 1)
  await declareLapse(page)
  await expect(page.getByText('Deux jours de suite avec un écart.', { exact: false })).toBeVisible()
  await expectStreak(page, 6, '00 h 00')
  await daysLater(page, 1)

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await expect(page.getByText('Ce sera une rechute')).toBeVisible()
  await tap(page, 'Oui, noter')

  await expectStreak(page, 0, '00 h 00')
  await expect(page.getByText(/Dernière cigarette/)).toHaveCount(0)
  await expectSmokeFreeDays(page, 4)
  await expect(totals(page)).toMatchAriaSnapshot(`
    - term: Jours sans fumer
    - definition: "4"
    - term: Plus long streak
    - definition: 7 j 00 h
  `)
  await expect(protocolSummary(page)).toContainText('Jour 8 sur 28')
})

test('a backdated lapse filling the gap between two lapse days makes a relapse', async ({
  page,
}) => {
  await daysIn(page, 3)
  await declareLapse(page)
  await daysLater(page, 2)
  await declareLapse(page)
  await expectStreak(page, 5, '00 h 00')

  // Lapses on day 4 and day 6 (now): the day in between completes the run.
  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await page.getByLabel('Quand').fill(await localInput(page, NOW + 4 * DAY))
  await expect(page.getByText('Ce sera une rechute')).toBeVisible()
  await tap(page, 'Oui, noter')

  // The streak restarts from the run's latest lapse, today's, not from the backdated one.
  await expectStreak(page, 0, '00 h 00')
})

test('leaving the lapse screen records nothing', async ({ page }) => {
  await daysIn(page, 3)

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await page.getByRole('link', { name: 'Annuler' }).click()

  await expectStreak(page, 3, '00 h 00')
  await expect(page.getByText(/Dernière cigarette/)).toHaveCount(0)
  await expect(totals(page)).toHaveCount(0)
})
