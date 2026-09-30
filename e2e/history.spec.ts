import { expect, type Page, test } from '@playwright/test'
import { UUID_V7 } from '../src/shared/test/uuid-v7'
import { expectStreak } from './support/assertions'
import { NOW } from './support/clock'
import { daysIn, declareLapse } from './support/flows'
import { patchCard, rows, tap, totals } from './support/locators'
import { sandboxAt, shiftClock } from './support/sandbox'

// Times on screen are local: the timezone is pinned so the times below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

const openHistory = (page: Page) => page.getByRole('link', { name: 'Historique' }).click()
const home = (page: Page) => page.getByRole('link', { name: 'Retour' }).click()

test('deleting the only lapse gives back its smoke-free day, behind a confirmation', async ({
  page,
}) => {
  await daysIn(page, 3)
  await declareLapse(page)
  await shiftClock(page, '+1 j')
  await expect(page.getByText(/Dernière cigarette/)).toBeVisible()
  await expect(totals(page).getByRole('definition').first()).toHaveText('2')

  await openHistory(page)
  await rows(page, /J’ai fumé/).click()
  await tap(page, 'Supprimer')
  await tap(page, 'Garder')
  await expect(page.getByRole('heading', { name: 'Modifier la cigarette' })).toBeVisible()

  await tap(page, 'Supprimer')
  await tap(page, 'Oui, supprimer')
  await expect(page.getByRole('status')).toHaveText('Supprimé.')
  await expect(rows(page, /J’ai fumé/)).toHaveCount(0)

  await home(page)
  await expectStreak(page, 4, '00 h 00')
  await expect(page.getByText(/Dernière cigarette/)).toHaveCount(0)
  await expect(totals(page)).toHaveCount(0)
})

test('deleting a lapse of a relapse restarts the streak from the quit moment and drops the personal best', async ({
  page,
}) => {
  await daysIn(page, 3)
  await declareLapse(page)
  await shiftClock(page, '+1 j')
  await declareLapse(page)
  await shiftClock(page, '+1 j')
  await declareLapse(page)
  await expectStreak(page, 0, '00 h 00')
  await expect(totals(page).getByText('Plus long streak')).toBeVisible()

  await openHistory(page)
  await expect(rows(page, /J’ai fumé/)).toHaveCount(3)
  await rows(page, /J’ai fumé/)
    .first()
    .click()
  await tap(page, 'Supprimer')
  await tap(page, 'Oui, supprimer')

  await home(page)
  await expectStreak(page, 5, '00 h 00')
  await expect(totals(page)).toBeVisible()
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
})

test('moving a patch application back across midnight makes today ask again', async ({ page }) => {
  await daysIn(page, 0)
  // 00:00 on 2 January: a new calendar day, a new patch.
  await shiftClock(page, '+1 h', 11)
  await tap(page, /^Poser le patch · 21\smg$/)
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg/)

  await openHistory(page)
  await expect(page.getByRole('heading', { name: 'Aujourd’hui' })).toBeVisible()
  await rows(page, /Patch posé/).click()
  await expect(page.getByLabel('Date et heure')).toHaveValue('2026-01-02T00:00')
  await page.getByLabel('Date et heure').fill('2026-01-01T23:30')
  await tap(page, 'Enregistrer')

  await expect(page.getByRole('status')).toHaveText('Modifié.')
  await expect(page.getByRole('heading', { name: 'Hier' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Aujourd’hui' })).toHaveCount(0)

  // Put on yesterday, the patch no longer counts for today.
  await home(page)
  await expect(patchCard(page)).toContainText('Pas encore posé')
})

test('an edit is refused before the quit moment or in the future, as at creation', async ({
  page,
}) => {
  await daysIn(page, 1)
  await declareLapse(page)
  await openHistory(page)
  await rows(page, /J’ai fumé/).click()

  await page.getByLabel('Quand').fill('2026-01-01T09:00')
  await tap(page, 'Enregistrer')
  await expect(page.getByRole('alert')).toHaveText('C’est avant ton arrêt : rien à noter.')

  await page.getByLabel('Quand').fill('2026-01-03T09:00')
  await tap(page, 'Enregistrer')
  await expect(page.getByRole('alert')).toHaveText('Ce moment n’est pas encore arrivé.')
})

test('a craving is edited and deleted in one tap, and the history empties', async ({ page }) => {
  await daysIn(page, 0)
  await page.getByRole('link', { name: 'Noter une envie passée' }).click()
  await tap(page, '2')
  await tap(page, 'Café')
  await tap(page, 'Enregistrer l’envie')

  await openHistory(page)
  await expect(rows(page, /Envie/)).toContainText('Intensité 2 · Café')
  await rows(page, /Envie/).click()
  await tap(page, '3')
  await tap(page, 'Enregistrer l’envie')
  await expect(rows(page, /Envie/)).toContainText('Intensité 3 · Café')

  await rows(page, /Envie/).click()
  await tap(page, 'Supprimer')
  await expect(page.getByRole('status')).toHaveText('Supprimé.')
  await expect(page.getByText('Rien de noté pour l’instant.', { exact: false })).toBeVisible()
})

test('a fact opens by its id, keeps it through an edit, and an unknown id finds nothing', async ({
  page,
}) => {
  await daysIn(page, 1)
  await declareLapse(page)
  await openHistory(page)
  // Retried until the history row replaces home's own « J’ai fumé » link.
  await expect(rows(page, /J’ai fumé/)).toHaveAttribute(
    'href',
    new RegExp(`/history/${UUID_V7.source}\\?`),
  )
  const href = await rows(page, /J’ai fumé/).getAttribute('href')

  await rows(page, /J’ai fumé/).click()
  await tap(page, 'Une de plus')
  await tap(page, 'Enregistrer')
  await expect(rows(page, /J’ai fumé/)).toContainText('2 cigarettes')
  await expect(rows(page, /J’ai fumé/)).toHaveAttribute('href', href ?? '')

  // A link from before ids, by position: it no longer points to any fact.
  await page.goto(sandboxAt(NOW, '/history/1'))
  await expect(page.getByText('Ce fait n’est plus dans le journal.')).toBeVisible()
})
