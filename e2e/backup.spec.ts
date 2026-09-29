import { readFile } from 'node:fs/promises'
import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxWith, startNow } from './sandbox'

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()
const marker = (page: Page) => page.getByRole('button', { name: 'Bac à sable', exact: true })
const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
const protocolSummary = (page: Page) => page.getByRole('region', { name: 'Protocole' })
const reminder = (page: Page) => page.getByRole('region', { name: 'Rappel de sauvegarde' })
const backupSection = (page: Page) => page.getByRole('region', { name: 'Sauvegarde' })
const factCount = (page: Page) => page.getByText(/^\d+ faits?$/)

async function openSettings(page: Page) {
  await page.getByRole('link', { name: 'Réglages' }).click()
  await expect(page.getByRole('heading', { name: 'Réglages' })).toBeVisible()
}

/** Taps an export button and returns the file it hands over, as its name and its text. */
async function exportFile(page: Page, button: string) {
  const download = page.waitForEvent('download')
  await tap(page, button)
  const file = await download
  const path = await file.path()
  return { name: file.suggestedFilename(), path, text: await readFile(path, 'utf8') }
}

/** Taps an import button and picks `file` in the chooser it opens. */
async function importFile(
  page: Page,
  button: string,
  file: string | { name: string; mimeType: string; buffer: Buffer },
) {
  const chooser = page.waitForEvent('filechooser')
  await tap(page, button)
  await (await chooser).setFiles(file)
}

/** Day 45 of the `day-45-lapse` scenario, as home shows it. */
async function expectDay45(page: Page) {
  await expectStreak(page, 44, '02 h 00')
  await expect(page.getByText('Dernière cigarette il y a 12 h 20 min.')).toBeVisible()
  await expect(totals(page).getByRole('definition').first()).toHaveText('42')
  await expect(protocolSummary(page)).toContainText('Jour 17 sur 28')
}

test('export, wipe, import: every figure comes back as it was', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await expectDay45(page)
  await openSettings(page)

  // The sandbox exports its own journal, and says so.
  await expect(backupSection(page)).toContainText('journal du bac à sable')
  const file = await exportFile(page, 'Exporter le bac à sable')
  expect(file.name).toMatch(/^quit-bac-a-sable-\d{4}-\d\d-\d\d\.json$/)
  expect(JSON.parse(file.text)).toMatchObject({
    format: 'quit-journal',
    version: 1,
    journal: { weeklySpendCents: 3500, baselineSmokesPerDay: 15 },
  })
  await expect(backupSection(page).getByRole('status')).toHaveText('Journal exporté.')

  await marker(page).click()
  await tap(page, 'Vider')
  await tap(page, 'Fermer')
  await expect(page.getByRole('button', { name: 'Maintenant', exact: true })).toBeVisible()

  // An empty journal has nothing to lose: no confirmation.
  await importFile(page, 'Restaurer une sauvegarde', file.path)

  await expect(page.getByText('Journal restauré.')).toBeVisible()
  await expectDay45(page)
})

test('a corrupted file is refused and the journal stays as it was', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await openSettings(page)
  const { text } = await exportFile(page, 'Exporter le bac à sable')

  await importFile(page, 'Importer dans le bac à sable', {
    name: 'quit-journal.json',
    mimeType: 'application/json',
    buffer: Buffer.from(text.slice(0, text.length / 2)),
  })

  await expect(backupSection(page).getByRole('alert')).toHaveText(
    'Ce fichier est illisible ou incomplet. Rien n’a changé.',
  )
  await page.getByRole('link', { name: 'Retour' }).click()
  await expectDay45(page)
})

test('replacing a journal that holds facts asks first', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await openSettings(page)
  const file = await exportFile(page, 'Exporter le bac à sable')

  await page.goto(sandboxWith('day-3-craving'))
  await marker(page).click()
  const day3Facts = await factCount(page).textContent()
  await tap(page, 'Fermer')
  await openSettings(page)

  await importFile(page, 'Importer dans le bac à sable', file.path)
  const dialog = page.getByRole('dialog', { name: 'Remplacer le bac à sable ?' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Garder le mien' }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('link', { name: 'Retour' }).click()
  await marker(page).click()
  await expect(factCount(page)).toHaveText(day3Facts ?? '')
  await tap(page, 'Fermer')

  await openSettings(page)
  await importFile(page, 'Importer dans le bac à sable', file.path)
  await dialog.getByRole('button', { name: 'Oui, remplacer' }).click()

  await expect(page.getByText('Journal restauré.')).toBeVisible()
  await marker(page).click()
  await expect(factCount(page)).not.toHaveText(day3Facts ?? '')
})

test('the reminder shows when no export exists, hides for a few days, then comes back', async ({
  page,
}) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await expect(reminder(page)).toContainText('Exporte-le pour ne rien perdre.')

  await reminder(page).getByRole('button', { name: 'Plus tard' }).click()
  await expect(reminder(page)).toHaveCount(0)

  await marker(page).click()
  await tap(page, '+1 j')
  await tap(page, '+1 j')
  await tap(page, 'Fermer')
  await expect(reminder(page)).toHaveCount(0)
  await marker(page).click()
  await tap(page, '+1 j')
  await tap(page, 'Fermer')
  await expect(reminder(page)).toBeVisible()

  // An export from the banner is a backup: the reminder goes away.
  const download = page.waitForEvent('download')
  await reminder(page).getByRole('button', { name: 'Exporter' }).click()
  await download
  await expect(reminder(page)).toHaveCount(0)
})

test('a sandbox export never replaces the real journal', async ({ page }) => {
  await page.goto(sandboxWith('day-45-lapse'))
  await openSettings(page)
  const file = await exportFile(page, 'Exporter le bac à sable')

  await page.goto('/')
  await startNow(page)
  await openSettings(page)
  await importFile(page, 'Importer une sauvegarde', file.path)

  await expect(backupSection(page).getByRole('alert')).toHaveText(
    'Cette sauvegarde vient du bac à sable : elle ne remplacera pas ton vrai journal. Rien n’a changé.',
  )
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('link', { name: 'Retour' }).click()
  await expectStreak(page, 0, '00 h \\d\\d')
})

// The real journal: real IndexedDB wiped for real, as iOS may do to a rarely opened PWA.
test('the real journal survives a storage wipe through its export', async ({ page }) => {
  await page.goto('/')
  await startNow(page)
  await openSettings(page)
  await expect(backupSection(page)).toContainText('Pas encore de sauvegarde.')
  const file = await exportFile(page, 'Exporter le journal')
  expect(file.name).toMatch(/^quit-journal-\d{4}-\d\d-\d\d\.json$/)
  await expect(backupSection(page)).toContainText('Dernière sauvegarde le')

  await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('quit')
        request.onsuccess = resolve
        request.onerror = reject
      }),
  )
  await page.reload()
  await expect(page.getByRole('button', { name: 'Maintenant', exact: true })).toBeVisible()

  await importFile(page, 'Restaurer une sauvegarde', file.path)
  await expect(page.getByText('Journal restauré.')).toBeVisible()
  await page.reload()
  await expectStreak(page, 0, '00 h \\d\\d')
  await openSettings(page)
  await expect(page.getByRole('textbox', { name: 'Dépense en tabac par semaine' })).toHaveValue(
    '35',
  )
  await expect(backupSection(page)).toContainText('Dernière sauvegarde le')
})
