import { expect, type Page, test } from '@playwright/test'

/** Two months of cravings: every screen has enough to scroll. */
const SCENARIO = 'day-60-cravings'

const envie = (page: Page) => page.getByRole('button', { name: 'Envie', exact: true })
const openWithScenario = (page: Page, path: string) =>
  page.goto(`${path}?debug=true&scenario=${SCENARIO}`)

/**
 * Scrolled to the end, how far the lowest piece of content reaches past the top of Envie's
 * fade band: zero or less means nothing sits under the pill, nor under its fade. The sandbox
 * pads `main` for its marker, which the real app does not: measured without that padding.
 */
const reachUnderEnvie = (page: Page) =>
  page.evaluate(() => {
    document.querySelector('main')?.style.setProperty('padding-bottom', '0px')
    window.scrollTo(0, document.documentElement.scrollHeight)
    const band = document.querySelector('[data-craving-launcher]')
    if (band === null) throw new Error('Envie is not on this screen')
    const bottoms = [...document.querySelectorAll('main *')]
      .filter(
        (element) =>
          element.children.length === 0 &&
          !band.contains(element) &&
          // Only what is painted: decorations and screen-reader-only text take no room on screen.
          element.closest('[aria-hidden="true"], .sr-only') === null,
      )
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.height > 0)
      .map((box) => box.bottom)
    return Math.max(...bottoms) - band.getBoundingClientRect().top
  })

const SCREENS = ['/', '/calendar', '/stats', '/history', '/settings']

test('Envie sits in the same place on every screen outside the forms, clear of their content', async ({
  page,
}) => {
  await openWithScenario(page, '/')
  const home = await envie(page).boundingBox()
  // It hugs its label: nowhere near the column's width.
  expect(home?.width).toBeLessThan((page.viewportSize()?.width ?? 0) / 3)

  for (const screen of SCREENS) {
    await openWithScenario(page, screen)
    await expect(envie(page), screen).toBeVisible()
    expect(await envie(page).boundingBox(), screen).toEqual(home)
    expect(await reachUnderEnvie(page), screen).toBeLessThanOrEqual(0)
  }
})

test('Envie stays off the forms, the craving timer and the screens before first launch', async ({
  page,
}) => {
  for (const screen of ['/calendar', '/history']) {
    await page.goto(screen)
    await expect(page.getByRole('heading', { level: 2 }).first(), screen).toBeVisible()
    await expect(envie(page), screen).toHaveCount(0)
  }

  for (const form of ['/lapse', '/patch/new', '/goal', '/craving/past', '/protocol']) {
    await openWithScenario(page, form)
    await expect(page.getByRole('heading', { level: 2 }).first(), form).toBeVisible()
    await expect(envie(page), form).toHaveCount(0)
  }

  await openWithScenario(page, '/history')
  await page
    .getByRole('link', { name: /Envie Intensité/ })
    .first()
    .click()
  await expect(page.getByRole('button', { name: 'Supprimer' })).toBeVisible()
  await expect(envie(page)).toHaveCount(0)

  await openWithScenario(page, '/')
  await envie(page).click()
  await expect(page.getByRole('timer', { name: 'Temps restant' })).toBeVisible()
  await expect(envie(page)).toHaveCount(0)
})
