import { expect, type Page, test } from '@playwright/test'
import { NOW } from './support/clock'
import { declareLapse, startNow } from './support/flows'
import { patchCard, protocolSummary, tap } from './support/locators'
import { daysLater, sandboxAt } from './support/sandbox'

// Days on screen are local: the timezone is pinned so the dates below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

const putPatchOn = async (page: Page) => {
  await tap(page, /^Poser le patch · 21\smg$/)
  await expect(patchCard(page)).toContainText('Posé à 13:00')
}

const day = (page: Page, name: string) => page.getByRole('cell', { name, exact: true })

test('several days of facts land on the right days of the calendar', async ({ page }) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await putPatchOn(page)

  await daysLater(page, 1)
  await putPatchOn(page)
  await declareLapse(page)

  // Saturday: a craving, no patch logged.
  await daysLater(page, 1)
  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')
  await expect(page.getByRole('status')).toHaveText('Envie notée.')

  await daysLater(page, 1)
  await page.getByRole('link', { name: 'Calendrier' }).click()

  await expect(page.getByRole('heading', { name: 'Calendrier' })).toBeVisible()
  await expect(protocolSummary(page)).toContainText('Étape 1 / 3')
  await expect(protocolSummary(page)).toContainText('Jour 4 sur 28')
  await expect(protocolSummary(page)).toContainText(
    /Prochaine étapejeudi 29 janvierpassage à 14\smg/,
  )
  await expect(protocolSummary(page)).toContainText('Fin prévuejeudi 26 mars')

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

  await protocolSummary(page).getByRole('link', { name: 'Modifier' }).click()
  await page.getByRole('group', { name: 'Étape 1' }).getByLabel('Durée (jours)').fill('21')
  await tap(page, 'Enregistrer')

  await page.getByRole('link', { name: 'Calendrier' }).click()
  await expect(protocolSummary(page)).toContainText('jeudi 22 janvier')
  await expect(protocolSummary(page)).toContainText('Fin prévuejeudi 19 mars')
  await expect(page.getByRole('region', { name: 'Les étapes' })).toContainText(
    /Étape 1 · 21\smg · en cours1 janv\. → 21 janv\./,
  )
})
