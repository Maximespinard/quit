import { expect, type Locator, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, sandboxWith, startNow, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
const notice = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text })

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (found === null) throw new Error('not rendered')
  return found
}

/** The confirmation sits between the hero and the first block, whole on screen, no scroll. */
async function expectUnderHero(page: Page, text: string) {
  const line = notice(page, text)
  await expect(line).toBeInViewport({ ratio: 1 })
  const [hero, status, blocks] = await Promise.all([
    box(streakRegion(page)),
    box(line),
    box(totals(page)),
  ])
  expect(status.y).toBeGreaterThanOrEqual(hero.y + hero.height)
  expect(status.y + status.height).toBeLessThanOrEqual(blocks.y)
}

/** A sandbox with a quit moment, its clock stopped on `NOW`. */
const homeWithStreak = async (page: Page) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')
}

test('a recorded craving is confirmed under the hero, and nothing else moves', async ({ page }) => {
  await homeWithStreak(page)
  const before = await box(totals(page))

  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await page.getByLabel('Date et heure').fill('2026-01-01T09:30')
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')

  await expectUnderHero(page, 'Envie notée.')
  expect(await box(totals(page))).toEqual(before)

  // Leaving home clears it, and the blocks stay where they were.
  await page.getByRole('link', { name: 'Statistiques des envies' }).click()
  await page.getByRole('link', { name: 'Retour' }).click()
  await expect(notice(page, 'Envie notée.')).toHaveCount(0)
  expect(await box(totals(page))).toEqual(before)
})

test('a declared lapse is confirmed under the hero', async ({ page }) => {
  await homeWithStreak(page)

  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await tap(page, 'Oui, noter')

  await expectUnderHero(page, 'C’est noté.')
})

test('a patch logged from its form is confirmed under the hero', async ({ page }) => {
  await homeWithStreak(page)

  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await tap(page, 'Enregistrer le patch')

  await expectUnderHero(page, 'Patch noté.')
})

test('an imported journal is confirmed under the hero', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await page.getByRole('link', { name: 'Réglages' }).click()
  const download = page.waitForEvent('download')
  await tap(page, 'Exporter le bac à sable')
  const file = await (await download).path()

  await page.getByRole('button', { name: 'Bac à sable', exact: true }).click()
  await tap(page, 'Vider')
  await tap(page, 'Fermer')
  const chooser = page.waitForEvent('filechooser')
  await tap(page, 'Restaurer une sauvegarde')
  await (await chooser).setFiles(file)

  await expectUnderHero(page, 'Journal restauré.')
})
