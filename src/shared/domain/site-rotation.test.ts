import {
  APPLICATION_SITES,
  type ApplicationSite,
  type PatchApplicationFact,
} from '@quit/contract/facts'
import { factId } from '@/shared/utils/fact-id'
import { recordPatchApplication } from './facts/patch-application'
import { emptyJournal, type Journal } from './journal'
import { siteRotation } from './site-rotation'

const DAY = 24 * 60 * 60_000

const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)
const QUIT = NOW - 10 * DAY

const applied = (id: number, at: number, site?: ApplicationSite): PatchApplicationFact =>
  site === undefined
    ? { type: 'patch-application', id: factId(id), at, doseMg: 21 }
    : { type: 'patch-application', id: factId(id), at, doseMg: 21, site }
const rotationAt = (now: number, ...applications: PatchApplicationFact[]) =>
  siteRotation(
    { ...emptyJournal, facts: [{ type: 'quit-moment', id: factId(1), at: QUIT }, ...applications] },
    now,
  )

describe('siteRotation — the suggested application site', () => {
  const suggestedAt = (now: number, ...applications: PatchApplicationFact[]) =>
    rotationAt(now, ...applications).suggestedSite

  it('suggests the first site for the first ever patch application', () => {
    expect(suggestedAt(NOW)).toBe('arm-left')
  })

  it('suggests the site after the previous patch application’s one', () => {
    expect(suggestedAt(NOW, applied(2, QUIT + DAY, 'arm-left'))).toBe('arm-right')
    expect(suggestedAt(NOW, applied(3, QUIT + DAY, 'chest-right'))).toBe('hip-left')
  })

  it('starts the list over after its last site', () => {
    expect(suggestedAt(NOW, applied(2, QUIT + DAY, 'hip-right'))).toBe('arm-left')
  })

  it('never suggests the previous patch application’s site, whichever it is', () => {
    for (const site of APPLICATION_SITES) {
      expect(suggestedAt(NOW, applied(2, QUIT + DAY, site))).not.toBe(site)
    }
  })

  it('rotates on from the site the user switched to, not from the one suggested', () => {
    // `arm-left` was suggested first; the user put the patch on the left hip instead.
    expect(suggestedAt(NOW, applied(2, QUIT + DAY, 'hip-left'))).toBe('hip-right')
  })

  it('rotates on from the latest site known when the previous patch application has none', () => {
    expect(suggestedAt(NOW, applied(2, QUIT + DAY, 'chest-left'), applied(3, QUIT + 2 * DAY))).toBe(
      'chest-right',
    )
  })

  it('suggests the first site when no patch application carries one', () => {
    expect(suggestedAt(NOW, applied(2, QUIT + DAY), applied(3, QUIT + 2 * DAY))).toBe('arm-left')
  })

  it('keys on the latest patch application in time, not the one recorded last', () => {
    const journal: Journal = {
      ...emptyJournal,
      facts: [
        { type: 'quit-moment', id: factId(1), at: QUIT },
        applied(2, QUIT + DAY, 'arm-left'),
        applied(3, QUIT + 3 * DAY, 'chest-left'),
      ],
    }
    // Caught up later: the day between the two, recorded after both.
    const backdated = recordPatchApplication(
      journal,
      { id: factId(4), at: QUIT + 2 * DAY, doseMg: 21, site: 'arm-right' },
      NOW,
    )
    if (!backdated.ok) throw new Error('the backdated application should be accepted')

    expect(siteRotation(backdated.journal, NOW).suggestedSite).toBe('chest-right')
  })

  it('takes the one recorded last when two patch applications share the same instant', () => {
    expect(
      suggestedAt(NOW, applied(2, QUIT + DAY, 'hip-left'), applied(3, QUIT + DAY, 'arm-left')),
    ).toBe('arm-right')
  })

  it('ignores a patch application later than now (a clock moved back)', () => {
    expect(
      suggestedAt(
        QUIT + DAY,
        applied(2, QUIT + DAY, 'arm-left'),
        applied(3, QUIT + 2 * DAY, 'hip-left'),
      ),
    ).toBe('arm-right')
  })
})

describe('siteRotation — the previous application site', () => {
  const previousAt = (now: number, ...applications: PatchApplicationFact[]) =>
    rotationAt(now, ...applications).previousSite

  it('is none before the first ever patch application', () => {
    expect(previousAt(NOW)).toBeNull()
  })

  it('is the site of the latest patch application in time, not the one recorded last', () => {
    expect(
      previousAt(
        NOW,
        applied(2, QUIT + 3 * DAY, 'chest-left'),
        applied(3, QUIT + 2 * DAY, 'arm-right'),
      ),
    ).toBe('chest-left')
  })

  it('is none when the previous patch application has no site, even if an earlier one had', () => {
    expect(
      previousAt(NOW, applied(2, QUIT + DAY, 'hip-left'), applied(3, QUIT + 2 * DAY)),
    ).toBeNull()
  })

  it('for a day caught up, is the site of the patch application before that day', () => {
    const facts = [applied(2, QUIT + DAY, 'arm-right'), applied(3, QUIT + 3 * DAY, 'hip-left')]

    expect(previousAt(QUIT + 2 * DAY, ...facts)).toBe('arm-right')
  })

  it('takes the one recorded last when two patch applications share the same instant', () => {
    expect(previousAt(NOW, applied(2, QUIT + DAY, 'hip-left'), applied(3, QUIT + DAY))).toBeNull()
  })

  it('is never the suggested site', () => {
    const facts = [applied(2, QUIT + DAY, 'arm-left'), applied(3, QUIT + 2 * DAY, 'hip-right')]

    expect(rotationAt(NOW, ...facts)).toMatchObject({
      previousSite: 'hip-right',
      suggestedSite: 'arm-left',
    })
  })
})
