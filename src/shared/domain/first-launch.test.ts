import { derive } from './derive'
import { startJourney } from './first-launch'
import { emptyJournal } from './journal'
import { defaultProtocol } from './protocol'

const MINUTE = 60_000
const NOW = Date.UTC(2026, 8, 22, 10, 0, 0)

describe('startJourney', () => {
  it('records the quit moment and the settings at once, on the default protocol', () => {
    const quitMoment = NOW - 90 * MINUTE

    const result = startJourney(
      emptyJournal,
      { quitMoment, weeklySpendCents: 4_200, baselineSmokesPerDay: 12 },
      NOW,
    )

    expect(result).toEqual({
      ok: true,
      journal: {
        facts: [{ type: 'quit-moment', at: quitMoment }],
        protocol: defaultProtocol,
        weeklySpendCents: 4_200,
        baselineSmokesPerDay: 12,
      },
    })
    if (result.ok) expect(derive(result.journal, NOW).streak?.elapsedMs).toBe(90 * MINUTE)
  })

  it('refuses a quit moment in the future and leaves the journal untouched', () => {
    expect(
      startJourney(
        emptyJournal,
        { quitMoment: NOW + MINUTE, weeklySpendCents: 4_200, baselineSmokesPerDay: 12 },
        NOW,
      ),
    ).toEqual({ ok: false, reason: 'future' })
  })

  it('refuses an invalid spend', () => {
    expect(
      startJourney(
        emptyJournal,
        { quitMoment: NOW, weeklySpendCents: -100, baselineSmokesPerDay: 12 },
        NOW,
      ),
    ).toEqual({ ok: false, reason: 'invalid-spend' })
  })

  it('refuses an invalid baseline', () => {
    expect(
      startJourney(
        emptyJournal,
        { quitMoment: NOW, weeklySpendCents: 4_200, baselineSmokesPerDay: 0 },
        NOW,
      ),
    ).toEqual({ ok: false, reason: 'invalid-baseline' })
  })
})
