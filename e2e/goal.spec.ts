import { expect, type Page, test } from '@playwright/test'
import { sandboxAt, startNow } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const goal = (page: Page) => page.getByRole('region', { name: 'Objectif' })
const figure = (page: Page, term: string) =>
  page.getByRole('term').filter({ hasText: term }).locator('+ dd')

async function daysLater(page: Page, days: number) {
  await page.getByRole('button', { name: 'Bac à sable' }).click()
  for (let day = 0; day < days; day += 1) await tap(page, '+1 j')
  await page.keyboard.press('Escape')
}

async function setGoal(page: Page, label: string, price: string) {
  await page.getByRole('textbox', { name: 'Ce que tu veux t’offrir' }).fill(label)
  await page.getByRole('textbox', { name: 'Son prix' }).fill(price)
  await tap(page, 'Enregistrer l’objectif')
}

test('a goal set, then time passing fills it until it is reached', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  // 35 € a week and 15 a day: 5 € and 15 cigarettes a day.
  await startNow(page)
  await expect(figure(page, 'Argent économisé')).toHaveText('0 €')
  await expect(figure(page, 'Cigarettes non fumées')).toHaveText('0')

  await goal(page).getByRole('link', { name: 'Choisir un objectif' }).click()
  await setGoal(page, '   ', '20')
  await expect(page.getByRole('alert')).toHaveText('Donne-lui un nom, en 60 caractères au plus.')
  await setGoal(page, 'Un casque', '20')

  await expect(goal(page)).toContainText('Un casque')
  await expect(goal(page)).toContainText('0 € sur 20 €')
  await expect(goal(page).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

  await daysLater(page, 1)
  await expect(figure(page, 'Argent économisé')).toHaveText('5 €')
  await expect(figure(page, 'Cigarettes non fumées')).toHaveText('15')
  await expect(goal(page)).toContainText('5 € sur 20 €')
  await expect(goal(page)).toContainText('25 %')

  await daysLater(page, 3)
  await expect(goal(page)).toContainText('Atteint')
  await expect(goal(page)).toContainText('L’argent est là : tu peux te l’offrir.')

  // The next goal starts again from zero: the money went on the first.
  await goal(page).getByRole('link', { name: 'Nouvel objectif' }).click()
  await expect(
    page.getByText('Ton objectif est atteint : le suivant repart de zéro.'),
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Ce que tu veux t’offrir' })).toHaveValue('')
  await setGoal(page, 'Un vélo', '400')
  await expect(goal(page)).toContainText('0 € sur 400 €')
  await expect(figure(page, 'Argent économisé')).toHaveText('20 €')
})

test('changing the weekly spend recomputes the money saved at once', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await daysLater(page, 7)
  await expect(figure(page, 'Argent économisé')).toHaveText('35 €')

  await page.getByRole('link', { name: 'Réglages' }).click()
  await page.getByRole('textbox', { name: 'Dépense en tabac par semaine' }).fill('48,90')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()

  await expect(figure(page, 'Argent économisé')).toHaveText('48,90 €')
})
