import { DAY_MS } from '@/shared/utils/duration'
import { derive } from './derive'
import type { CravingFact, CravingIntensity } from './facts/craving'
import { emptyJournal, type Journal } from './journal'
import type { Protocol } from './protocol'
import { scenarioById } from './scenarios'

/** A local wall-clock instant in 2026, in the pinned Europe/Paris zone; `month` is 1-based. */
const local = (month: number, day: number, hour = 0, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).getTime()

const craving = (
  at: number,
  intensity: CravingIntensity = 2,
  tags: readonly string[] = [],
  heldToEnd = true,
): CravingFact => ({ type: 'craving', at, intensity, heldToEnd, tags })

const journalOf = (
  quitMoment: number,
  cravings: readonly CravingFact[],
  protocol?: Protocol,
): Journal => ({
  ...emptyJournal,
  ...(protocol === undefined ? {} : { protocol }),
  facts: [{ type: 'quit-moment', at: quitMoment }, ...cravings],
})

const statsOf = (journal: Journal, now: number) => {
  const { cravingStats } = derive(journal, now)
  if (cravingStats === null) throw new Error('no quit moment')
  return cravingStats
}

const QUIT = local(9, 1, 9)
const NOW = local(9, 5, 20)

describe('derive, craving stats', () => {
  it('holds nothing before the first craving, over a day per bucket since the quit day', () => {
    const stats = statsOf(journalOf(QUIT, []), NOW)

    expect(stats).toMatchObject({
      count: 0,
      heldToEnd: 0,
      riskiestHour: null,
      byIntensity: { 1: 0, 2: 0, 3: 0 },
      byTag: [],
      untagged: 0,
    })
    expect(stats.byHour).toEqual(Array.from({ length: 24 }, () => 0))
    expect(stats.trend.period).toBe('day')
    expect(stats.trend.buckets.map((bucket) => bucket.start)).toEqual([
      local(9, 1),
      local(9, 2),
      local(9, 3),
      local(9, 4),
      local(9, 5),
    ])
  })

  it('buckets cravings by local hour of day and names the riskiest one', () => {
    const stats = statsOf(
      journalOf(QUIT, [
        craving(local(9, 1, 18, 5)),
        craving(local(9, 2, 8, 10)),
        craving(local(9, 3, 8, 50)),
        craving(local(9, 4, 23, 59)),
      ]),
      NOW,
    )

    expect(stats.byHour[8]).toBe(2)
    expect(stats.byHour[18]).toBe(1)
    expect(stats.byHour[23]).toBe(1)
    expect(stats.riskiestHour).toBe(8)
  })

  it('names the earliest hour when two hours tie', () => {
    const stats = statsOf(journalOf(QUIT, [craving(local(9, 2, 21)), craving(local(9, 3, 7))]), NOW)

    expect(stats.riskiestHour).toBe(7)
  })

  it('keeps the wall-clock hour across the autumn daylight-saving change', () => {
    // 25 October 2026: 03:00 CEST becomes 02:00 CET, so 02:30 happens twice, an hour apart.
    const quitMoment = local(10, 20, 9)
    const firstHalfPast2 = Date.UTC(2026, 9, 25, 0, 30)
    const secondHalfPast2 = firstHalfPast2 + 60 * 60_000
    const stats = statsOf(
      journalOf(quitMoment, [
        craving(firstHalfPast2),
        craving(secondHalfPast2),
        craving(local(10, 26, 18)),
      ]),
      local(10, 27, 12),
    )

    expect(stats.byHour[2]).toBe(2)
    expect(stats.byHour[1]).toBe(0)
    expect(stats.byHour[18]).toBe(1)
  })

  it('keeps each craving on its local calendar day across the spring change (23 h day)', () => {
    // 29 March 2026: 02:00 CET becomes 03:00 CEST, the day lasts 23 hours.
    const quitMoment = local(3, 27, 20)
    const stats = statsOf(
      journalOf(quitMoment, [
        craving(local(3, 29, 3, 30), 3),
        craving(local(3, 29, 23, 30), 1),
        craving(local(3, 30, 0, 30), 2),
      ]),
      local(3, 30, 12),
    )

    expect(stats.byHour[3]).toBe(1)
    expect(stats.byHour[23]).toBe(1)
    expect(stats.trend.buckets).toEqual([
      { start: local(3, 27), end: local(3, 28), days: 1, count: 0, averageIntensity: null },
      { start: local(3, 28), end: local(3, 29), days: 1, count: 0, averageIntensity: null },
      { start: local(3, 29), end: local(3, 30), days: 1, count: 2, averageIntensity: 2 },
      { start: local(3, 30), end: local(3, 31), days: 1, count: 1, averageIntensity: 2 },
    ])
  })

  it('counts each tag once per craving, merged by case and spacing, spelled as last used', () => {
    const stats = statsOf(
      journalOf(QUIT, [
        craving(local(9, 1, 10), 2, ['coffee', 'jeu  vidéo']),
        craving(local(9, 2, 10), 2, ['Jeu vidéo']),
        craving(local(9, 3, 10), 2, ['stress', 'coffee']),
        craving(local(9, 4, 10), 2, ['coffee']),
        craving(local(9, 4, 12), 2),
        craving(local(9, 4, 14), 2),
      ]),
      NOW,
    )

    expect(stats.byTag).toEqual([
      { tag: 'coffee', count: 3 },
      { tag: 'Jeu vidéo', count: 2 },
      { tag: 'stress', count: 1 },
    ])
    expect(stats.untagged).toBe(2)
  })

  it('puts the most recently used tag first when two tags tie', () => {
    const stats = statsOf(
      journalOf(QUIT, [
        craving(local(9, 1, 10), 2, ['meal']),
        craving(local(9, 2, 10), 2, ['break']),
      ]),
      NOW,
    )

    expect(stats.byTag.map((entry) => entry.tag)).toEqual(['break', 'meal'])
  })

  it('counts cravings by intensity and those held to the end of the timer', () => {
    const stats = statsOf(
      journalOf(QUIT, [
        craving(local(9, 1, 10), 3, [], true),
        craving(local(9, 2, 10), 3, [], false),
        craving(local(9, 3, 10), 1, [], true),
      ]),
      NOW,
    )

    expect(stats).toMatchObject({ count: 3, heldToEnd: 2, byIntensity: { 1: 1, 2: 0, 3: 2 } })
  })

  it('averages the intensity of each day’s cravings, none on a day without', () => {
    const stats = statsOf(
      journalOf(QUIT, [
        craving(local(9, 1, 10), 3),
        craving(local(9, 1, 22), 2),
        craving(local(9, 3, 10), 1),
      ]),
      NOW,
    )

    expect(
      stats.trend.buckets.map(({ count, averageIntensity }) => [count, averageIntensity]),
    ).toEqual([
      [2, 2.5],
      [0, null],
      [1, 1],
      [0, null],
      [0, null],
    ])
  })

  it('switches to weeks ending today past two weeks, the oldest cut at the quit day and shorter', () => {
    const now = local(9, 16, 20)
    const stats = statsOf(
      journalOf(QUIT, [craving(local(9, 2, 10)), craving(local(9, 3, 10)), craving(local(9, 12))]),
      now,
    )

    expect(stats.trend.period).toBe('week')
    expect(stats.trend.buckets).toEqual([
      { start: local(9, 1), end: local(9, 3), days: 2, count: 1, averageIntensity: 2 },
      { start: local(9, 3), end: local(9, 10), days: 7, count: 1, averageIntensity: 2 },
      { start: local(9, 10), end: local(9, 17), days: 7, count: 1, averageIntensity: 2 },
    ])
  })

  it('counts a week’s days on the calendar, whole across a daylight-saving change', () => {
    // The week ending Monday 30 March 2026 holds the 23 h day of 29 March: still seven days.
    const stats = statsOf(journalOf(local(3, 1, 9), []), local(3, 30, 12))

    expect(stats.trend.buckets.at(-1)).toMatchObject({
      start: local(3, 24),
      end: local(3, 31),
      days: 7,
    })
  })

  it('marks each step change in the bucket it falls in, only once it has happened', () => {
    const protocol: Protocol = [
      { doseMg: 21, durationDays: 3 },
      { doseMg: 14, durationDays: 2 },
      { doseMg: 7, durationDays: 10 },
    ]
    // Steps change on 4 September and 6 September at 09:00, the quit moment's time.
    const stats = statsOf(journalOf(QUIT, [], protocol), NOW)

    expect(stats.trend.stepChanges).toEqual([{ bucketIndex: 3, stepNumber: 2, doseMg: 14 }])
  })

  it('leaves out cravings the clock has not reached, as a moved sandbox clock can', () => {
    const stats = statsOf(
      journalOf(QUIT, [craving(local(9, 2, 10)), craving(local(9, 4, 10))]),
      local(9, 3, 12),
    )

    expect(stats.count).toBe(1)
    expect(stats.trend.buckets).toHaveLength(3)
  })

  it('draws no trend while the clock is before the quit moment', () => {
    expect(statsOf(journalOf(QUIT, []), QUIT - DAY_MS).trend.buckets).toEqual([])
  })

  it('day 60: most cravings come at 18:00 and over coffee, and they fade week after week', () => {
    const { journal, now } = scenarioById('day-60-cravings')
    const stats = statsOf(journal, now)
    const counts = stats.trend.buckets.map((bucket) => bucket.count)

    expect(stats.riskiestHour).toBe(18)
    expect(stats.byTag[0]?.tag).toBe('coffee')
    expect(stats.trend.period).toBe('week')
    expect(counts.at(-1)).toBeLessThan(counts[1] ?? 0)
    expect(stats.trend.stepChanges.map((change) => change.doseMg)).toEqual([14, 7])
  })
})
