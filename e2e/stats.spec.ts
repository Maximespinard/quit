import { expect, type Page, test } from '@playwright/test'
import { NOW } from './support/clock'
import { startNow } from './support/flows'
import { sandboxAt, sandboxWith } from './support/sandbox'

// Hours on screen are local: the timezone is pinned so the scenario's 18:00 stays 18:00.
test.use({ timezoneId: 'Europe/Paris' })

const openStats = (page: Page) =>
  page.getByRole('link', { name: 'Statistiques des envies' }).click()
const summary = (page: Page) => page.getByRole('region', { name: 'En bref' })

test('two months of cravings: the riskiest hour, the top situation and the trend', async ({
  page,
}) => {
  await page.goto(sandboxWith('day-60-cravings'))
  await openStats(page)

  await expect(page.getByRole('heading', { name: 'Tes envies' })).toBeVisible()
  await expect(summary(page)).toMatchAriaSnapshot(`
    - term: Envies notées
    - definition: "92"
    - term: Tenues jusqu’au bout
    - definition: /75\\s%/
    - term: Heure la plus risquée
    - definition: /18\\sh/
    - term: Situation la plus fréquente
    - definition: Café
  `)

  const byHour = page.getByRole('table', { name: 'Heure de la journée' })
  await expect(byHour.getByRole('row', { name: /^18\sh – 19\sh/ })).toContainText('35 envies')

  const situations = page.getByRole('region', { name: 'Situations' })
  await expect(situations.getByRole('listitem').first()).toContainText('Café')
  await expect(situations.getByRole('listitem').last()).toContainText('Sans situation')

  // The trend runs by week, both step-downs marked on it.
  const trend = page.getByRole('region', { name: 'Au fil du temps' })
  await expect(
    trend.getByRole('table', { name: 'Envies par jour, en moyenne sur chaque semaine' }),
  ).toBeAttached()
  await expect(trend.getByText(/^Étape 2 à 14\smg · /)).toBeAttached()
  await expect(trend.getByText(/^Étape 3 à 7\smg · /)).toBeAttached()
})

test('without a craving the screen says what will appear, with no chart', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await openStats(page)

  await expect(
    page.getByText(/^Rien à compter pour l’instant\. Dès 5\senvies notées/),
  ).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
})

test('with too few cravings the screen counts them towards the charts', async ({ page }) => {
  await page.goto(sandboxWith('step-down-eve'))
  await openStats(page)

  await expect(page.getByText(/^4\senvies notées sur les 5/)).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)

  await page.getByRole('link', { name: 'Retour' }).click()
  await expect(page.getByRole('link', { name: 'Statistiques des envies' })).toBeVisible()
})
