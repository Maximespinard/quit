import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, startNow } from './sandbox'

// Times on screen are local: the timezone is pinned so the times below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

/** 13:00 in Paris. */
const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' }).click()
const totals = (page: Page) => page.getByRole('region', { name: 'Ce qui reste acquis' })
const patchCard = (page: Page) => page.getByRole('region', { name: 'Patch du jour' })
const rows = (page: Page, name: RegExp) => page.getByRole('link', { name })

const shiftClock = async (page: Page, shift: string, times = 1) => {
  await tap(page, 'Bac à sable')
  for (let i = 0; i < times; i += 1) await tap(page, shift)
  await tap(page, 'Fermer')
}

/** A sandbox whose quit moment is `NOW`, its clock then moved `days` on. */
const daysIn = async (page: Page, days: number) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  if (days > 0) await shiftClock(page, '+1 j', days)
}

const declareLapse = async (page: Page) => {
  await page.getByRole('link', { name: 'J’ai fumé' }).click()
  await tap(page, 'Oui, noter')
  await expect(page.getByRole('status').filter({ hasText: 'C’est noté.' })).toBeVisible()
}

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
  await expect(totals(page).getByRole('definition').first()).toHaveText('3')
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
  await expect(totals(page).getByText('Plus long streak')).toHaveCount(0)
})

test('moving a patch application across midnight moves the patch of the day with it', async ({
  page,
}) => {
  await daysIn(page, 0)
  // 00:00 on 2 January: the protocol day begun at 13:00 still runs.
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

  await home(page)
  await expect(patchCard(page)).toContainText('Posé à 23:30')
  await expect(patchCard(page)).toContainText(/hier · 21\smg/)
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
