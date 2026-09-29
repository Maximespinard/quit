import { expect, type Page, test } from '@playwright/test'
import { sandboxAt, startNow } from './sandbox'

// Days on screen are local: the timezone is pinned so the dates below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

/** Thursday 1 January 2026, 13:00 in Paris. */
const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' }).click()

const nextDay = async (page: Page) => {
  await tap(page, 'Bac à sable')
  await tap(page, '+1 j')
  await tap(page, 'Fermer')
}

const putPatchOn = async (page: Page) => {
  await tap(page, /^Poser le patch · 21\smg$/)
  await expect(page.getByRole('region', { name: 'Patch du jour' })).toContainText('Posé à 13:00')
}

const summary = (page: Page) => page.getByRole('region', { name: 'Protocole' })
const day = (page: Page, name: string) => page.getByRole('cell', { name, exact: true })

test('several days of facts land on the right days of the calendar', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await putPatchOn(page)

  await nextDay(page)
  await putPatchOn(page)
  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await tap(page, 'Oui, noter')
  await expect(page.getByRole('status').filter({ hasText: 'C’est noté.' })).toBeVisible()

  // Saturday: a craving, no patch logged.
  await nextDay(page)
  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')
  await expect(page.getByRole('status')).toHaveText('Envie notée.')

  await nextDay(page)
  await page.getByRole('link', { name: 'Calendrier' }).click()

  await expect(page.getByRole('heading', { name: 'Calendrier' })).toBeVisible()
  await expect(summary(page)).toContainText('Étape 1 / 3')
  await expect(summary(page)).toContainText('Jour 4 sur 28')
  await expect(summary(page)).toContainText(/Prochaine étapejeudi 29 janvierpassage à 14\smg/)
  await expect(summary(page)).toContainText('Fin prévuejeudi 26 mars')

  await expect(page.getByRole('heading', { name: 'Janvier 2026' })).toBeVisible()
  await expect(
    day(page, 'jeudi 1 janvier, début de l’étape 1 à 21\u00a0mg, patch posé'),
  ).toBeVisible()
  await expect(day(page, 'vendredi 2 janvier, patch posé, 1 cigarette')).toBeVisible()
  await expect(day(page, 'samedi 3 janvier, patch pas noté, 1 envie')).toBeVisible()
  await expect(day(page, 'dimanche 4 janvier, aujourd’hui, patch à poser')).toBeVisible()
  await expect(day(page, 'jeudi 29 janvier, début de l’étape 2 à 14 mg, patch prévu')).toBeVisible()

  await tap(page, 'Mois suivant')
  await tap(page, 'Mois suivant')
  await expect(page.getByRole('heading', { name: 'Mars 2026' })).toBeVisible()
  await expect(day(page, 'jeudi 26 mars, fin du protocole')).toBeVisible()
  // Past the end, nothing is asked for: a bare date.
  await expect(day(page, 'vendredi 27 mars')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mois suivant' })).toBeDisabled()
})

test('a protocol edit moves the next step change and the planned end at once', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)

  await page
    .getByRole('region', { name: 'Protocole' })
    .getByRole('link', { name: 'Modifier' })
    .click()
  await page.getByRole('group', { name: 'Étape 1' }).getByLabel('Durée (jours)').fill('21')
  await tap(page, 'Enregistrer')

  await page.getByRole('link', { name: 'Calendrier' }).click()
  await expect(summary(page)).toContainText('jeudi 22 janvier')
  await expect(summary(page)).toContainText('Fin prévuejeudi 19 mars')
  await expect(page.getByRole('region', { name: 'Les étapes' })).toContainText(
    /Étape 1 · 21\smg · en cours1 janv\. → 21 janv\./,
  )
})
