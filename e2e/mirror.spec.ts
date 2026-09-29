import { expect, type Page, test } from '@playwright/test'
import { apiUrl, issueDeviceKey } from './mirror-server'
import { startNow, streakRegion } from './sandbox'

const tap = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).click()

// Against the image (E2E_BASE_URL), no API is started beside the app for the suite to drive.
test.skip(!!process.env.E2E_BASE_URL, 'needs the API the suite starts')

test('paste the device key, log a craving: the mirror holds it', async ({ page, request }) => {
  const key = issueDeviceKey()
  await page.goto('/')
  await startNow(page)
  await expect(streakRegion(page)).toBeVisible()

  await page.getByRole('link', { name: 'Réglages' }).click()
  await page.getByRole('textbox', { name: 'Clé de l’appareil' }).fill(key)
  await tap(page, 'Lier ce téléphone')
  await expect(page.getByRole('status').filter({ hasText: 'Téléphone lié.' })).toBeVisible()

  await page.getByRole('link', { name: 'Retour' }).click()
  await tap(page, 'Envie')
  await tap(page, 'Arrêter')
  await tap(page, '2')
  await tap(page, 'Enregistrer l’envie')
  await expect(page.getByRole('status').filter({ hasText: 'Envie notée.' })).toBeVisible()

  await expect(async () => {
    const mirror = await request.get(`${apiUrl}/api/mirror`, {
      headers: { authorization: `Bearer ${key}` },
    })
    expect(mirror.status()).toBe(200)
    expect((await mirror.json()).facts).toEqual([
      expect.objectContaining({ type: 'craving', intensity: 2, heldToEnd: false }),
    ])
  }).toPass()
})
