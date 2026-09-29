import { expect, type Page, test } from '@playwright/test'
import { expectStreak, startNow, streakRegion } from './sandbox'

/** Resolves once the service worker has precached the app and controls the page. */
const waitForServiceWorker = (page: Page) =>
  page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (navigator.serviceWorker.controller) return
    await new Promise((resolve) =>
      navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }),
    )
  })

// One online load is enough: from then on the app starts and records with the network off.
test('after one online load, the app launches and works offline', async ({ page, context }) => {
  await page.goto('/')
  await waitForServiceWorker(page)

  await context.setOffline(true)
  await page.reload()

  await startNow(page)
  await expectStreak(page, 0, '00:00:\\d\\d')

  await page.reload()
  await expect(streakRegion(page)).toBeVisible()

  // The typeface carries the identity: it comes from the precache, not a system fallback.
  const loaded = await page.evaluate(async () =>
    (await document.fonts.load('500 16px "Host Grotesk Variable"')).map((face) => face.status),
  )
  expect(loaded).toContain('loaded')
})
