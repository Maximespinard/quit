import { expect, type Locator, type Page, test } from '@playwright/test'
import { button, rows } from './support/locators'
import { sandboxWith } from './support/sandbox'

// Day 45: a goal, a lapse, cravings and patch applications, all in the journal already.
const atDay45 = (path: string) => sandboxWith('day-45-lapse', path)

/** Opens the history detail of the first fact whose row matches `row`. */
const openFact = async (page: Page, row: RegExp) => {
  await page.goto(atDay45('/history'))
  await rows(page, row).first().click()
  await expect(button(page, 'Supprimer')).toBeVisible()
}

/** Whether a tap at the centre of `target` lands on it, not on something drawn over it. */
const hitAtCentre = (target: Locator) =>
  target.evaluate((element) => {
    const { x, y, width, height } = element.getBoundingClientRect()
    const hit = document.elementFromPoint(x + width / 2, y + height / 2)
    return hit !== null && element.contains(hit)
  })

/**
 * The actions sit at the bottom of the screen without scrolling: the primary one in its lowest
 * part, the way out right under it, down at the bottom edge. A form taller than the screen has
 * no way out in view: its primary action sticks there alone.
 */
const expectInThumbZone = async (page: Page, primary: Locator, wayOut: Locator | null) => {
  const viewport = page.viewportSize()
  if (viewport === null) throw new Error('No viewport to measure')
  const bottom = async (action: Locator) => {
    await expect(action).toBeInViewport()
    const box = await action.boundingBox()
    if (box === null) throw new Error('No layout to measure')
    return box.y + box.height
  }
  expect(await bottom(primary)).toBeGreaterThan(viewport.height * 0.7)
  if (wayOut === null) return
  // Room for the page's bottom padding (home indicator, sandbox marker), nothing more.
  expect(await bottom(wayOut)).toBeGreaterThan(viewport.height - 100)
}

type FormCase = {
  name: string
  open: (page: Page) => Promise<unknown>
  primary: string
  /** `null` when the form outgrows the screen: the way out then comes by scrolling. */
  wayOut: string | null
}

const screens: readonly FormCase[] = [
  {
    name: 'goal',
    open: (page) => page.goto(atDay45('/goal')),
    primary: 'Enregistrer l’objectif',
    wayOut: 'Annuler',
  },
  {
    name: 'lapse',
    open: (page) => page.goto(atDay45('/lapse')),
    primary: 'Oui, noter',
    wayOut: 'Annuler',
  },
  {
    name: 'past craving',
    open: (page) => page.goto(atDay45('/craving/past')),
    primary: 'Enregistrer l’envie',
    wayOut: 'Annuler',
  },
  {
    name: 'patch application',
    open: (page) => page.goto(atDay45('/patch/new')),
    primary: 'Enregistrer le patch',
    wayOut: 'Annuler',
  },
  ...[/J’ai fumé/, /Envie/, /Patch posé/].map((row) => ({
    name: `history detail of ${row.source}`,
    open: (page: Page) => openFact(page, row),
    primary: row.source === 'Envie' ? 'Enregistrer l’envie' : 'Enregistrer',
    // A craving opens with its intensity picked, so its tags shown: taller than the screen.
    wayOut: row.source === 'Envie' ? null : 'Retour',
  })),
]

test.describe('on an iPhone 16 Pro, installed on the home screen', () => {
  // Standalone, the app gets the whole 874px screen, not Safari's viewport under its bars.
  test.use({ viewport: { width: 402, height: 874 } })

  for (const screen of screens) {
    test(`the ${screen.name} form holds its actions at the bottom of the screen`, async ({
      page,
    }) => {
      await screen.open(page)
      await expectInThumbZone(
        page,
        button(page, screen.primary),
        screen.wayOut === null ? null : page.getByRole('link', { name: screen.wayOut }),
      )
    })
  }
})

test.describe('on a small screen', () => {
  test.use({ viewport: { width: 320, height: 480 } })

  test('the longest form scrolls to its actions, and nothing covers them', async ({ page }) => {
    await openFact(page, /Patch posé/)
    const actions = [
      button(page, 'Enregistrer'),
      button(page, 'Supprimer'),
      page.getByRole('link', { name: 'Retour' }),
    ]

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    for (const action of actions) {
      await expect(action).toBeInViewport()
      expect(await hitAtCentre(action)).toBe(true)
    }
  })

  test('a past craving keeps recording within reach while its tags push the form down', async ({
    page,
  }) => {
    await page.goto(atDay45('/craving/past'))
    await button(page, '3').click()

    const record = button(page, 'Enregistrer l’envie')
    await expect(record).toBeInViewport()
    expect(await hitAtCentre(record)).toBe(true)
  })
})
