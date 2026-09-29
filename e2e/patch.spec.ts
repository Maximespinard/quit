import { expect, type Page, test } from '@playwright/test'
import { expectStreak, sandboxAt, shiftClock, startNow } from './sandbox'

// Times on screen are local: the timezone is pinned so the times below are fixed.
test.use({ timezoneId: 'Europe/Paris' })

/** 13:00 in Paris. */
const NOW = Date.UTC(2026, 0, 1, 12, 0, 0)

const tap = (page: Page, name: string | RegExp) =>
  page.getByRole('button', { name, exact: typeof name === 'string' }).click()
const patchCard = (page: Page) => page.getByRole('region', { name: 'Patch du jour' })

/** A sandbox with a quit moment, its clock stopped on `NOW`. */
const homeWithStreak = async (page: Page) => {
  await page.goto(sandboxAt(NOW))
  await startNow(page)
  await expectStreak(page, 0, '00 h 00')
}

test('one tap logs the patch; it holds until midnight, the new day asks again', async ({
  page,
}) => {
  await homeWithStreak(page)
  await expect(patchCard(page)).toContainText('Pas encore posé')

  await tap(page, /^Poser le patch · 21\smg$/)

  await expect(patchCard(page)).toContainText('Posé à 13:00')
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg/)
  await expect(page.getByRole('button', { name: /^Poser le patch/ })).toHaveCount(0)

  // 23:00, still the same calendar day: nothing more is asked.
  await shiftClock(page, '+1 h', 10)
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg/)

  // Midnight: a new day, a new patch.
  await shiftClock(page, '+1 h')
  await expect(patchCard(page)).toContainText('Pas encore posé')
  await expect(page.getByRole('button', { name: /^Poser le patch · 21\smg$/ })).toBeVisible()
})

test('after an evening quit, the morning patch is today’s all evening, as on the calendar', async ({
  page,
}) => {
  // 20:00 in Paris.
  await page.goto(sandboxAt(Date.UTC(2026, 0, 1, 19, 0, 0)))
  await startNow(page)

  // 20:00 the next day, the morning's patch caught up at 08:00.
  await shiftClock(page, '+1 j')
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await page.getByLabel('Date et heure').fill('2026-01-02T08:00')
  await tap(page, 'Enregistrer le patch')
  await expect(page.getByRole('status').filter({ hasText: 'Patch noté.' })).toBeVisible()

  // 21:00: the protocol day began at 20:00, but the calendar day still holds the patch.
  await shiftClock(page, '+1 h')
  await expect(patchCard(page)).toContainText('Posé à 08:00')
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg/)
  await expect(page.getByRole('button', { name: /^Poser le patch/ })).toHaveCount(0)

  await page.getByRole('link', { name: 'Calendrier' }).click()
  await expect(
    page.getByRole('cell', { name: 'vendredi 2 janvier, aujourd’hui, patch posé', exact: true }),
  ).toBeVisible()
})

const siteGroup = (page: Page) => patchCard(page).getByRole('group', { name: 'Où le poser' })
const pressedSite = (page: Page) => siteGroup(page).locator('[aria-pressed="true"]')
const barredSites = (page: Page) => siteGroup(page).locator('[aria-disabled="true"]')

test('two days in a row, the second suggested site differs from the first', async ({ page }) => {
  await homeWithStreak(page)
  await expect(pressedSite(page)).toHaveAccessibleName('Bras gauche')
  await expect(pressedSite(page)).toHaveAccessibleDescription('suggéré')

  // One tap still logs the patch, at the suggested site.
  await tap(page, /^Poser le patch · 21\smg$/)
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg · Bras gauche/)

  await shiftClock(page, '+1 j')
  await expect(pressedSite(page)).toHaveAccessibleName('Bras droit')
  // Yesterday's site is greyed and named as such.
  await expect(barredSites(page)).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Bras gauche', exact: true }),
  ).toHaveAccessibleDescription('la dernière fois')
  await tap(page, /^Poser le patch · 21\smg$/)
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg · Bras droit/)
})

test('the site is switched in one tap, or left out', async ({ page }) => {
  await homeWithStreak(page)

  await tap(page, 'Hanche droite')
  await tap(page, /^Poser le patch/)
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg · Hanche droite/)

  // The rotation goes on from the site switched to, which cannot be picked again.
  await shiftClock(page, '+1 j')
  await expect(pressedSite(page)).toHaveAccessibleName('Bras gauche')
  const previous = page.getByRole('button', { name: 'Hanche droite', exact: true })
  await expect(previous).toHaveAttribute('aria-disabled', 'true')
  await previous.click({ force: true })
  await expect(pressedSite(page)).toHaveAccessibleName('Bras gauche')

  // Pressed again, the suggested site is left out.
  await tap(page, 'Bras gauche')
  await expect(pressedSite(page)).toHaveCount(0)
  await tap(page, /^Poser le patch/)
  await expect(patchCard(page).getByRole('paragraph')).toHaveText(/aujourd’hui · 21\smg$/)

  // A patch without a site leaves the rotation where it was, and bars no site.
  await shiftClock(page, '+1 j')
  await expect(pressedSite(page)).toHaveAccessibleName('Bras gauche')
  await expect(barredSites(page)).toHaveCount(0)
})

test('a missed day is caught up and a dose overridden for one patch only', async ({ page }) => {
  await homeWithStreak(page)
  await shiftClock(page, '+1 j')

  // Catch up yesterday evening: today stays to log.
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await page.getByLabel('Date et heure').fill('2026-01-01T20:00')
  await tap(page, 'Enregistrer le patch')

  await expect(page.getByRole('status').filter({ hasText: 'Patch noté.' })).toBeVisible()
  await expect(patchCard(page)).toContainText('Pas encore posé')

  // Today, a cut patch: the dose differs, the protocol does not.
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await expect(page.getByLabel('Dose (mg)')).toHaveValue('21')
  await page.getByLabel('Dose (mg)').fill('10,5')
  await tap(page, 'Enregistrer le patch')

  await expect(patchCard(page)).toContainText('Posé à 13:00')
  await expect(patchCard(page)).toContainText(/aujourd’hui · 10,5\smg/)
  await expect(page.getByRole('region', { name: 'Protocole' })).toContainText(/21\smg/)
})

test('a patch before the quit moment or in the future is refused', async ({ page }) => {
  await homeWithStreak(page)
  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()

  await page.getByLabel('Date et heure').fill('2026-01-01T09:00')
  await tap(page, 'Enregistrer le patch')
  await expect(page.getByRole('alert')).toHaveText(
    'C’est avant ton arrêt : le protocole n’avait pas commencé.',
  )

  await page.getByLabel('Date et heure').fill('2026-01-02T09:00')
  await tap(page, 'Enregistrer le patch')
  await expect(page.getByRole('alert')).toHaveText('Ce moment n’est pas encore arrivé.')
})

test('the form sent untouched logs a patch seconds after the quit moment', async ({ page }) => {
  // The quit moment carries seconds the minute-precision date field cannot show.
  await page.goto(sandboxAt(NOW + 37_000))
  await startNow(page)

  await page.getByRole('link', { name: 'Autre dose ou autre date' }).click()
  await tap(page, 'Enregistrer le patch')

  await expect(page.getByRole('status').filter({ hasText: 'Patch noté.' })).toBeVisible()
  await expect(patchCard(page)).toContainText('Posé à 13:00')
  await expect(patchCard(page)).toContainText(/aujourd’hui · 21\smg/)
})

test('a tap refused on a clock moved before the quit moment says why', async ({ page }) => {
  await homeWithStreak(page)
  await shiftClock(page, '−1 h')

  await tap(page, /^Poser le patch/)

  await expect(patchCard(page).getByRole('alert')).toHaveText(
    'C’est avant ton arrêt : le protocole n’avait pas commencé.',
  )
})
