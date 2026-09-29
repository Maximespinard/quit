import { expect, type Locator, type Page, test } from '@playwright/test'
import { sandboxWith } from './sandbox'

// Day 45: a goal, a lapse, cravings and patch applications, all in the journal already.
const seeded = (path: string) => sandboxWith('day-45-lapse').replace('/?', `${path}?`)

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const rows = (page: Page, name: RegExp) => page.getByRole('link', { name })

/** Opens the history detail of the first fact whose row matches `row`. */
const openFact = async (page: Page, row: RegExp) => {
  await page.goto(seeded('/history'))
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
 * part, the way out right under it, down at the bottom edge.
 */
const expectInThumbZone = async (page: Page, primary: Locator, wayOut: Locator) => {
  const viewport = page.viewportSize()
  if (viewport === null) throw new Error('No viewport to measure')
  const bottom = async (action: Locator) => {
    await expect(action).toBeInViewport()
    const box = await action.boundingBox()
    if (box === null) throw new Error('No layout to measure')
    return box.y + box.height
  }
  expect(await bottom(primary)).toBeGreaterThan(viewport.height * 0.7)
  // Room for the page's bottom padding (home indicator, sandbox marker), nothing more.
  expect(await bottom(wayOut)).toBeGreaterThan(viewport.height - 100)
}

type FormScreen = {
  name: string
  open: (page: Page) => Promise<unknown>
  primary: string
  wayOut: string
}

const screens: readonly FormScreen[] = [
  {
    name: 'goal',
    open: (page) => page.goto(seeded('/goal')),
    primary: 'Enregistrer l’objectif',
    wayOut: 'Annuler',
  },
  {
    name: 'lapse',
    open: (page) => page.goto(seeded('/lapse')),
    primary: 'Oui, noter',
    wayOut: 'Annuler',
  },
  {
    name: 'past craving',
    open: (page) => page.goto(seeded('/craving/past')),
    primary: 'Enregistrer l’envie',
    wayOut: 'Annuler',
  },
  {
    name: 'patch application',
    open: (page) => page.goto(seeded('/patch/new')),
    primary: 'Enregistrer le patch',
    wayOut: 'Annuler',
  },
  {
    name: 'history detail',
    open: (page) => openFact(page, /J’ai fumé/),
    primary: 'Enregistrer',
    wayOut: 'Retour',
  },
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
        page.getByRole('link', { name: screen.wayOut }),
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
    await page.goto(seeded('/craving/past'))
    await button(page, '3').click()

    const record = button(page, 'Enregistrer l’envie')
    await expect(record).toBeInViewport()
    expect(await hitAtCentre(record)).toBe(true)
  })
})
