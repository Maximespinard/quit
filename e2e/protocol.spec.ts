import { expect, type Page, test } from '@playwright/test'
import { sandboxAt, streakRegion } from './sandbox'

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const protocolSummary = (page: Page) => page.getByRole('region', { name: 'Protocole' })
const step = (page: Page, number: number) => page.getByRole('group', { name: `Étape ${number}` })

async function openEditor(page: Page) {
  await protocolSummary(page).getByRole('link', { name: 'Modifier' }).click()
  await expect(page.getByRole('heading', { name: 'Protocole' })).toBeVisible()
}

test('first launch lands on the default protocol, untouched', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByRole('button', { name: 'Maintenant' }).click()

  await expect(streakRegion(page)).toContainText('Étape 1 · 21 mg')
  await expect(protocolSummary(page)).toContainText('Étape 1 / 3')
  await expect(protocolSummary(page)).toContainText('Jour 1 sur 28')
  await expect(protocolSummary(page)).toContainText('encore 28 j avant 14 mg')
})

test('editing a step shows on the home screen, in the same sandbox', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByRole('button', { name: 'Maintenant' }).click()
  await openEditor(page)

  await step(page, 1).getByLabel('Dose (mg)').fill('25')
  await step(page, 1).getByLabel('Durée (jours)').fill('10')
  await step(page, 1).getByLabel('Marque (facultatif)').fill('Nicopatch')
  await page.getByRole('button', { name: 'Enregistrer' }).click()

  // Still the sandbox: its clock and its journal survived the round trip.
  await expect(page).toHaveURL(new RegExp(`debug=true.*clock=${NOW}`))
  await expect(streakRegion(page)).toContainText('Étape 1 · 25 mg')
  await expect(protocolSummary(page)).toContainText('Jour 1 sur 10')
  await expect(protocolSummary(page)).toContainText('25 mg · encore 10 j avant 14 mg')
  await expect(protocolSummary(page)).toContainText('Nicopatch')
})

test('steps can be added, reordered and removed, never down to zero', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByRole('button', { name: 'Maintenant' }).click()
  await openEditor(page)

  await page.getByRole('button', { name: 'Ajouter une étape' }).click()
  await step(page, 4).getByLabel('Dose (mg)').fill('3,5')
  await page.getByRole('button', { name: 'Monter l’étape 4' }).click()
  await page.getByRole('button', { name: 'Supprimer l’étape 1' }).click()
  await page.getByRole('button', { name: 'Supprimer l’étape 1' }).click()
  await page.getByRole('button', { name: 'Supprimer l’étape 2' }).click()

  await expect(page.getByRole('button', { name: 'Supprimer l’étape 1' })).toBeDisabled()
  await expect(step(page, 1).getByLabel('Dose (mg)')).toHaveValue('3,5')

  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(streakRegion(page)).toContainText('Étape 1 · 3,5 mg')
  await expect(protocolSummary(page)).toContainText('encore 28 j avant la fin')
})

test('a step without a dose is refused and nothing is saved', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await page.getByRole('button', { name: 'Maintenant' }).click()
  await openEditor(page)

  await step(page, 2).getByLabel('Dose (mg)').fill('')
  await page.getByRole('button', { name: 'Enregistrer' }).click()

  await expect(page.getByRole('alert')).toHaveText(
    'Chaque étape a besoin d’une dose et d’une durée en jours entiers.',
  )
  await expect(step(page, 2).getByLabel('Dose (mg)')).toHaveAttribute('aria-invalid', 'true')

  await page.getByRole('link', { name: 'Retour' }).click()
  await expect(protocolSummary(page)).toContainText('encore 28 j avant 14 mg')
})

// Persistence is the real journal's job: real IndexedDB, real clock.
test('the protocol survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Maintenant' }).click()
  await openEditor(page)

  await step(page, 1).getByLabel('Durée (jours)').fill('35')
  await page.getByRole('button', { name: 'Enregistrer' }).click()
  await expect(protocolSummary(page)).toContainText('Jour 1 sur 35')

  await page.reload()

  await expect(protocolSummary(page)).toContainText('Jour 1 sur 35')
})
