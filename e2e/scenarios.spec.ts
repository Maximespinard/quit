import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, sandboxWith } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const marker = (page: Page) => page.getByRole('button', { name: 'Bac à sable' })
const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
const protocolSummary = (page: Page) => page.getByRole('region', { name: 'Protocole' })
const patchCard = (page: Page) => page.getByRole('region', { name: 'Patch du jour' })
const factCount = (page: Page) => page.getByText(/^\d+ faits?$/)

test('a scenario in the url seeds the sandbox: day 45 shows yesterday’s slip', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))

  await expectStreak(page, 44, '02:00:00')
  await expect(page.getByText('Dernière cigarette il y a 12 h 20 min.')).toBeVisible()
  await expect(page.getByText('Un jour avec un écart.', { exact: false })).toBeVisible()
  await expect(totals(page).getByRole('definition').first()).toHaveText('42')
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
  await expect(protocolSummary(page)).toContainText('Jour 17 sur 28')
  await expect(patchCard(page)).toContainText('Posé à 09:15')
})

test('the panel loads a scenario, marks it current, and the real journal is untouched', async ({
  page,
}) => {
  await page.goto('/')
  await tap(page, 'Maintenant')
  await expectStreak(page, 0, '00:00:\\d\\d')

  await page.goto(sandboxAt(NOW))
  await marker(page).click()
  await tap(page, 'Jour 29, étape 2')
  await expect(page.getByRole('button', { name: 'Jour 29, étape 2' })).toHaveAttribute(
    'aria-current',
    'true',
  )
  await expect(page.getByRole('button', { name: 'Jour 45, un écart hier' })).not.toHaveAttribute(
    'aria-current',
    'true',
  )
  await tap(page, 'Fermer')

  await expectStreak(page, 28, '01:15:00')
  await expect(protocolSummary(page)).toContainText('Étape 2 / 3')
  await expect(protocolSummary(page)).toContainText('Jour 1 sur 28')
  await expect(page.getByRole('button', { name: /^Poser le patch · 14\smg$/ })).toBeVisible()

  // Wiping empties the sandbox and clears the current scenario.
  await marker(page).click()
  await tap(page, 'Vider')
  await expect(page.getByRole('button', { name: 'Jour 29, étape 2' })).not.toHaveAttribute(
    'aria-current',
    'true',
  )
  await tap(page, 'Fermer')
  await expect(page.getByRole('button', { name: 'Maintenant' })).toBeVisible()

  // The real journal still holds its own quit moment, and nothing else.
  await page.goto('/')
  await expect(marker(page)).toHaveCount(0)
  await expectStreak(page, 0, '00:00:\\d\\d')
})

test('a craving and a lapse are injected at the sandbox’s current time', async ({ page }) => {
  await page.goto(sandboxWith('day-29'))
  await marker(page).click()
  await expect(factCount(page)).toHaveText('34 faits')

  await tap(page, 'Injecter une envie')
  await expect(factCount(page)).toHaveText('35 faits')

  await tap(page, 'Injecter un écart')
  await expect(factCount(page)).toHaveText('36 faits')
  await tap(page, 'Fermer')

  // A slip at the sandbox's clock: the streak keeps running from the quit moment.
  await expect(page.getByText('Dernière cigarette il y a moins d’une minute.')).toBeVisible()
  await expectStreak(page, 28, '01:15:00')
})

test('nothing can be injected before a quit moment exists', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await marker(page).click()

  await expect(page.getByRole('button', { name: 'Injecter une envie' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Injecter un écart' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Sauter à l’étape suivante' })).toBeDisabled()
})

test('the clock jumps to the next step change, then to the end of the protocol', async ({
  page,
}) => {
  await page.goto(sandboxWith('step-down-eve'))
  await expect(protocolSummary(page)).toContainText('Jour 28 sur 28')
  await expect(protocolSummary(page)).toContainText('encore 1 j avant 14 mg')

  await marker(page).click()
  await tap(page, 'Sauter à l’étape suivante')
  await tap(page, 'Fermer')

  await expectStreak(page, 28, '00:00:00')
  await expect(protocolSummary(page)).toContainText('Étape 2 / 3')
  await expect(protocolSummary(page)).toContainText('Jour 1 sur 28')
  await expect(page.getByRole('button', { name: /^Poser le patch · 14\smg$/ })).toBeVisible()

  await marker(page).click()
  await tap(page, 'Sauter à l’étape suivante')
  await tap(page, 'Sauter à la fin du protocole')
  await expect(page.getByRole('button', { name: 'Sauter à l’étape suivante' })).toBeDisabled()
  await tap(page, 'Fermer')

  await expectStreak(page, 84, '00:00:00')
  await expect(protocolSummary(page)).toContainText('Protocole terminé')
  await expect(patchCard(page)).toHaveCount(0)
})
