import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
const protocolSummary = (page: Page) => page.getByRole('region', { name: 'Protocole' })

/** A sandbox whose quit moment is `NOW`, its clock then moved three days on. */
const threeDaysIn = async (page: Page) => {
  await page.goto(sandboxAt(NOW))
  await tap(page, 'Maintenant')
  await tap(page, 'Bac à sable')
  for (let day = 0; day < 3; day += 1) await tap(page, '+1 j')
  await tap(page, 'Fermer')
  await expectStreak(page, 3, '00:00:00')
}

test('a declared lapse restarts the streak, keeps the total and shows the personal best', async ({
  page,
}) => {
  await threeDaysIn(page)
  // Quit mid-day on day 1, now mid-day on day 4: days 2 and 3 are whole and over.
  await expect(totals(page)).toMatchAriaSnapshot(`
    - term: Jours sans fumer au total
    - definition: "2"
  `)
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
  await expect(protocolSummary(page)).toContainText('Jour 4 sur 28')

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await expect(page.getByRole('heading', { name: 'Tu as fumé' })).toBeVisible()
  await tap(page, 'Oui, noter')

  await expect(page.getByRole('status').filter({ hasText: 'C’est noté.' })).toBeVisible()
  await expectStreak(page, 0, '00:00:00')
  await expect(totals(page)).toMatchAriaSnapshot(`
    - term: Jours sans fumer au total
    - definition: "2"
    - term: Plus long streak
    - definition: 3 j 00 h
  `)
  await expect(protocolSummary(page)).toContainText('Jour 4 sur 28')
})

test('a backdated lapse restarts the streak from its own time', async ({ page }) => {
  await threeDaysIn(page)

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  const when = page.getByLabel('Quand')
  const now = await when.inputValue()
  // Two hours before the sandbox clock, on the same local day.
  await when.fill(
    now.replace(/T(\d\d)/, (_, hour: string) => `T${String(Number(hour) - 2).padStart(2, '0')}`),
  )
  await tap(page, 'Oui, noter')

  await expectStreak(page, 0, '02:00:00')
})

test('leaving the lapse screen records nothing', async ({ page }) => {
  await threeDaysIn(page)

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await page.getByRole('link', { name: 'Annuler' }).click()

  await expectStreak(page, 3, '00:00:00')
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
})
