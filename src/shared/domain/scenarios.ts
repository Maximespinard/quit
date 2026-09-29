import { DAY_MS, HOUR_MS, MINUTE_MS } from '@/shared/utils/duration'
import type { CravingFact, CravingIntensity } from './facts/craving'
import type { LapseFact } from './facts/lapse'
import type { PatchApplicationFact } from './facts/patch-application'
import type { Fact } from './facts/registry'
import type { Journal } from './journal'
import { defaultProtocol, type Protocol } from './protocol'

/**
 * A named journal paired with a value of the current time: one precise situation of the app.
 * One source, read three ways: the derivation tests pin down what each one derives to, the
 * debug panel loads them, and demo mode will seed itself from one. Nothing here grants a
 * derived value (ADR-0002): a level or a badge is only ever reached through the facts below.
 *
 * Adding a scenario is one more `scenario(...)` entry in `scenarios`; the type checker then
 * asks for its name in `strings.debug.scenario`.
 */
export type Scenario = {
  readonly id: ScenarioId
  readonly now: number
  readonly journal: Journal
}

/**
 * A local wall-clock instant in 2026; `month` is 1-based. Local, so the calendar-day rules
 * (smoke-free days, lapse runs) read the same on any device. May to early August: no
 * daylight-saving change falls in the window in the zones that have one.
 */
const local = (month: number, day: number, hour: number, minute = 0): number =>
  new Date(2026, month - 1, day, hour, minute).getTime()

/** Every scenario quits on Monday 4 May 2026 at 09:00, on the default protocol. */
const QUIT = local(5, 4, 9)

/** The instant `days` protocol days, then `hours` and `minutes`, after the quit moment. */
const sinceQuit = (days: number, hours = 0, minutes = 0): number =>
  QUIT + days * DAY_MS + hours * HOUR_MS + minutes * MINUTE_MS

/**
 * One patch application per protocol day, put on at 09:15, for the first `days` days,
 * each at the dose of the step the day falls in.
 */
function dailyPatches(protocol: Protocol, days: number): PatchApplicationFact[] {
  const patches: PatchApplicationFact[] = []
  let stepStart = 0
  for (const step of protocol) {
    for (let day = stepStart; day < Math.min(days, stepStart + step.durationDays); day += 1)
      patches.push({ type: 'patch-application', at: sinceQuit(day, 0, 15), doseMg: step.doseMg })
    stepStart += step.durationDays
  }
  return patches
}

const craving = (
  at: number,
  intensity: CravingIntensity,
  heldToEnd: boolean,
  tags: readonly string[] = [],
): CravingFact => ({ type: 'craving', at, intensity, heldToEnd, tags })

const lapse = (at: number, count = 1): LapseFact => ({ type: 'lapse', at, count })

const byInstant = (a: Fact, b: Fact) => a.at - b.at

/**
 * A journal on the default protocol, first launch done (35 € a week, 15 a day), its facts
 * sorted into the order they happened.
 */
const journalOf = (...facts: readonly (Fact | readonly Fact[])[]): Journal => {
  const quitMoment: Fact = { type: 'quit-moment', at: QUIT }
  return {
    protocol: defaultProtocol,
    weeklySpendCents: 3500,
    baselineSmokesPerDay: 15,
    goal: null,
    facts: [quitMoment, ...facts.flat()].sort(byInstant),
  }
}

/** The cravings of the first month, shared by every scenario that runs past it. */
const firstMonthCravings = [
  craving(sinceQuit(3, 1), 3, true, ['coffee']),
  craving(sinceQuit(7, 9), 2, true, ['stress']),
  craving(sinceQuit(12, 4, 30), 1, true),
  craving(sinceQuit(20, 11), 2, false, ['evening-out']),
]

/**
 * Two months of cravings that fade: three a day the first two weeks, two the next two, one
 * the next two, then one every other day. They come most often at 18:00 and over a coffee,
 * each hour and each situation taken in turn from a fixed round, and weaken month after month.
 */
function fadingCravings(): CravingFact[] {
  const hours = [18, 8, 13, 18, 21, 10, 18, 16]
  const tags: readonly (readonly string[])[] = [
    ['coffee'],
    ['stress'],
    ['coffee', 'break'],
    [],
    ['meal'],
    ['coffee'],
    ['evening-out'],
    ['boredom'],
  ]
  // One in three is a notch below the day's usual: not every craving is the worst.
  const notchLower: Record<CravingIntensity, CravingIntensity> = { 1: 1, 2: 1, 3: 2 }
  const perDay = (day: number) => (day < 15 ? 3 : day < 29 ? 2 : day < 43 ? 1 : 1 - (day % 2))
  const cravings: CravingFact[] = []
  for (let day = 1; day < 59; day += 1) {
    const intensity: CravingIntensity = day < 21 ? 3 : day < 42 ? 2 : 1
    for (let nth = 0; nth < perDay(day); nth += 1) {
      const round = cravings.length
      const hour = hours[round % hours.length] ?? 18
      cravings.push(
        craving(
          local(5, 4 + day, hour, 10),
          round % 3 === 2 ? notchLower[intensity] : intensity,
          round % 4 !== 3,
          tags[round % tags.length] ?? [],
        ),
      )
    }
  }
  return cravings
}

const scenario = <Id extends string>(id: Id, now: number, journal: Journal) => ({
  id,
  now,
  journal,
})

export const scenarios = [
  // Wednesday 6 May, 16:30. A strong craving logged three minutes ago — the nearest a journal
  // gets to "mid-craving": the running timer lives in the url, not in the journal.
  scenario(
    'day-3-craving',
    sinceQuit(2, 7, 30),
    journalOf(dailyPatches(defaultProtocol, 3), [
      craving(sinceQuit(0, 2), 3, true, ['coffee']),
      craving(sinceQuit(0, 5, 30), 2, false, ['break']),
      craving(sinceQuit(1, 0, 40), 2, true, ['coffee']),
      craving(sinceQuit(1, 12), 3, true, ['evening-out']),
      craving(sinceQuit(2, 7, 27), 3, false, ['stress']),
    ]),
  ),
  // Sunday 31 May, 20:00: the 28th and last day of the 21 mg step.
  scenario(
    'step-down-eve',
    sinceQuit(27, 11),
    journalOf(dailyPatches(defaultProtocol, 28), firstMonthCravings),
  ),
  // Monday 1 June, 10:15: the first day of the 14 mg step, its patch not yet put on.
  scenario(
    'day-29',
    sinceQuit(28, 1, 15),
    journalOf(dailyPatches(defaultProtocol, 28), firstMonthCravings, [
      craving(sinceQuit(26, 3), 1, true, ['meal']),
    ]),
  ),
  // Wednesday 17 June, 11:00. One cigarette last night at 22:40: a slip, not a relapse.
  // Saving for a 400 € bike since the quit moment: a little over half way.
  scenario('day-45-lapse', sinceQuit(44, 2), {
    ...journalOf(dailyPatches(defaultProtocol, 45), firstMonthCravings, [
      craving(sinceQuit(29, 10), 2, true, ['stress']),
      craving(sinceQuit(43, 13, 30), 3, false, ['evening-out']),
      lapse(sinceQuit(43, 13, 40)),
    ]),
    goal: { label: 'Un vélo', priceCents: 40_000, countsFrom: null, celebrated: false },
  }),
  // Monday 3 August, 12:00: the 84-day protocol ended a week ago, the streak goes on.
  scenario(
    'protocol-over',
    sinceQuit(91, 3),
    journalOf(dailyPatches(defaultProtocol, 84), firstMonthCravings, [
      craving(sinceQuit(29, 10), 2, true, ['stress']),
      craving(sinceQuit(60, 8), 1, true, ['boredom']),
    ]),
  ),
  // Thursday 2 July, 18:00: two months of cravings, fading, across both step-downs.
  scenario(
    'day-60-cravings',
    sinceQuit(59, 9),
    journalOf(dailyPatches(defaultProtocol, 60), fadingCravings()),
  ),
] as const

export type ScenarioId = (typeof scenarios)[number]['id']

export const isScenarioId = (value: unknown): value is ScenarioId =>
  scenarios.some((scenario) => scenario.id === value)

export function scenarioById(id: ScenarioId): Scenario {
  const found = scenarios.find((scenario) => scenario.id === id)
  if (found === undefined) throw new Error(`Unknown scenario: ${id}`)
  return found
}
