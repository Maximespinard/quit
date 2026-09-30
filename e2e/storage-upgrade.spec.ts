import { expect, type Page, test } from '@playwright/test'
import { DAY, HOUR } from './support/clock'
import { expectIdentified, type IdentifiedFact, withoutIds } from './support/fact-ids'

/**
 * The journal as the previous storage version held it: facts without ids, each type at
 * least once, relative to real time — the real journal runs on the real clock.
 */
const previousJournal = (now: number) => ({
  facts: [
    { type: 'quit-moment', at: now - 3 * DAY },
    { type: 'patch-application', at: now - 3 * DAY + HOUR, doseMg: 21, site: 'arm-left' },
    { type: 'craving', at: now - 2 * DAY, intensity: 2, heldToEnd: true, tags: ['coffee'] },
    { type: 'lapse', at: now - DAY, count: 2 },
  ],
  protocol: [{ doseMg: 21, durationDays: 28 }],
  weeklySpendCents: 3_500,
  baselineSmokesPerDay: 15,
  goal: null,
})

/** Writes `journal` as storage version 2 wrote it, on the app's origin, before the app opens. */
async function seedPreviousVersion(page: Page, journal: unknown) {
  await page.route('**/seed', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>seed</title>' }),
  )
  await page.goto('/seed')
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('quit', 2)
        request.onerror = () => reject(request.error)
        request.onupgradeneeded = () => {
          request.result.createObjectStore('journal')
          request.result.createObjectStore('backup')
        }
        request.onsuccess = () => {
          const db = request.result
          const write = db.transaction('journal', 'readwrite')
          write.objectStore('journal').put(value, 'current')
          write.oncomplete = () => {
            db.close()
            resolve()
          }
          write.onerror = () => reject(write.error)
        }
      }),
    journal,
  )
}

/** The facts as the device now stores them, and the storage version holding them. */
const stored = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ version: number; facts: IdentifiedFact[] }>((resolve, reject) => {
        const request = indexedDB.open('quit')
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          const read = db.transaction('journal').objectStore('journal').get('current')
          read.onerror = () => reject(read.error)
          read.onsuccess = () => {
            resolve({
              version: db.version,
              facts: (read.result as { facts: IdentifiedFact[] }).facts,
            })
            db.close()
          }
        }
      }),
  )

// Real journal: the upgrade runs on the device's own IndexedDB.
test('the storage upgrade gives every stored fact an id and loses none', async ({ page }) => {
  const now = Date.now()
  const journal = previousJournal(now)
  await seedPreviousVersion(page, journal)

  await page.goto('/')
  await page.getByRole('link', { name: 'Historique' }).click()
  await expect(page.getByRole('link', { name: /J’ai fumé/ })).toContainText('2 cigarettes')
  await expect(page.getByRole('link', { name: /Envie/ })).toContainText('Intensité 2 · Café')
  await expect(page.getByRole('link', { name: /Patch posé/ })).toContainText('Bras gauche')

  const upgraded = await stored(page)
  // Straight from version 2 to the current one: 3 gave facts ids, 4 added the mirror records.
  expect(upgraded.version).toBe(4)
  expect(withoutIds(upgraded.facts)).toEqual(journal.facts)
  expectIdentified(upgraded.facts)

  // The ids stay: a reload reads the same ones back.
  await page.reload()
  await expect(page.getByRole('link', { name: /J’ai fumé/ })).toBeVisible()
  expect((await stored(page)).facts).toEqual(upgraded.facts)
})
