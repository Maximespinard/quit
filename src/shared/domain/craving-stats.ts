import { DAY_MS } from '@/shared/utils/duration'
import {
  CRAVING,
  type CravingFact,
  type CravingIntensity,
  tagKey,
  uniqueTags,
} from './facts/craving'
import type { Journal } from './journal'
import { localMidnight } from './local-day'
import type { Protocol } from './protocol'

/** Below this many cravings the stats screen explains itself instead of drawing charts. */
export const MIN_CRAVINGS_FOR_STATS = 5

/** Up to this many calendar days since the quit day, the trend runs a day per bucket. */
const DAILY_TREND_DAYS = 14

/** One stretch of local calendar days on the trend: `[start, end)`, both local midnights. */
export type TrendBucket = {
  readonly start: number
  readonly end: number
  /** Calendar days it spans: 1 on a day, 7 on a week, fewer on the oldest week, cut at the quit day. */
  readonly days: number
  readonly count: number
  /** Mean of the bucket's intensities, 1 to 3; `null` without a craving to average. */
  readonly averageIntensity: number | null
}

/** A step of the protocol beginning inside the trend's bucket `bucketIndex`. */
export type StepChange = {
  readonly bucketIndex: number
  /** 1-based, like the copy shows it; never 1, which starts at the quit moment. */
  readonly stepNumber: number
  readonly doseMg: number
}

export type CravingTrend = {
  readonly period: 'day' | 'week'
  /** Oldest first, the last one holding today. */
  readonly buckets: readonly TrendBucket[]
  readonly stepChanges: readonly StepChange[]
}

export type TagCount = { readonly tag: string; readonly count: number }

/** When and why cravings happen, and whether they fade: every figure counts cravings. */
export type CravingStats = {
  readonly count: number
  /** Cravings whose timer ran to its end. */
  readonly heldToEnd: number
  /** 24 counts, one per local wall-clock hour: index 18 holds 18:00 to 18:59. */
  readonly byHour: readonly number[]
  /** The hour holding the most cravings, the earliest on a tie; `null` without any. */
  readonly riskiestHour: number | null
  readonly byIntensity: Readonly<Record<CravingIntensity, number>>
  /** Most frequent first, the most recently used on a tie; a tag is spelled as last used. */
  readonly byTag: readonly TagCount[]
  /** Cravings logged without any tag. */
  readonly untagged: number
  readonly trend: CravingTrend
}

/** Local calendar days of the trend: one each up to two weeks, then weeks ending today. */
function trendRanges(quitMoment: number, now: number) {
  if (now < quitMoment) return { period: 'day' as const, ranges: [] }
  const first = localMidnight(quitMoment)
  const days: number[] = []
  // Walked on the calendar, never in 24 h blocks: a daylight-saving change keeps each day whole.
  for (let day = first; day <= now; day = localMidnight(day, 1)) days.push(day)
  if (days.length <= DAILY_TREND_DAYS) {
    return {
      period: 'day' as const,
      ranges: days.map((start) => ({ start, end: localMidnight(start, 1), days: 1 })),
    }
  }
  const ranges: { start: number; end: number; days: number }[] = []
  for (let end = localMidnight(now, 1); end > first; end = localMidnight(end, -7)) {
    const start = Math.max(first, localMidnight(end, -7))
    ranges.unshift({ start, end, days: days.filter((day) => start <= day && day < end).length })
  }
  return { period: 'week' as const, ranges }
}

/** Where each later step begins, as protocol days run from the quit moment in 24 h blocks. */
function stepStarts(protocol: Protocol, quitMoment: number) {
  let days = 0
  return protocol.map((step, index) => {
    const at = quitMoment + days * DAY_MS
    days += step.durationDays
    return { at, stepNumber: index + 1, doseMg: step.doseMg }
  })
}

function trendOf(
  cravings: readonly CravingFact[],
  protocol: Protocol,
  quitMoment: number,
  now: number,
): CravingTrend {
  const { period, ranges } = trendRanges(quitMoment, now)
  const bucketOf = (at: number) => ranges.findIndex(({ start, end }) => start <= at && at < end)
  const buckets = ranges.map(({ start, end, days }) => {
    const inside = cravings.filter((craving) => start <= craving.at && craving.at < end)
    const total = inside.reduce((sum, craving) => sum + craving.intensity, 0)
    return {
      start,
      end,
      days,
      count: inside.length,
      averageIntensity: inside.length === 0 ? null : total / inside.length,
    }
  })
  const stepChanges = stepStarts(protocol, quitMoment)
    .slice(1)
    .filter(({ at }) => at <= now)
    .map(({ at, stepNumber, doseMg }) => ({ bucketIndex: bucketOf(at), stepNumber, doseMg }))
    .filter(({ bucketIndex }) => bucketIndex >= 0)
  return { period, buckets, stepChanges }
}

function tagCounts(cravings: readonly CravingFact[]): readonly TagCount[] {
  const byKey = new Map<string, { tag: string; count: number; lastAt: number }>()
  // Oldest first: each later use respells the tag and moves its last use forward.
  for (const craving of cravings.toSorted((a, b) => a.at - b.at)) {
    for (const tag of uniqueTags(craving.tags)) {
      const count = (byKey.get(tagKey(tag))?.count ?? 0) + 1
      byKey.set(tagKey(tag), { tag, count, lastAt: craving.at })
    }
  }
  return [...byKey.values()]
    .toSorted((a, b) => b.count - a.count || b.lastAt - a.lastAt)
    .map(({ tag, count }) => ({ tag, count }))
}

/**
 * Craving stats from the quit moment up to `now`, hours and days read on the local clock.
 * Only reachable through `derive`.
 */
export function cravingStats(journal: Journal, quitMoment: number, now: number): CravingStats {
  const cravings = journal.facts.filter(
    (fact): fact is CravingFact => fact.type === CRAVING && fact.at >= quitMoment && fact.at <= now,
  )
  const byHour = Array.from({ length: 24 }, () => 0)
  const byIntensity = { 1: 0, 2: 0, 3: 0 }
  for (const craving of cravings) {
    const hour = new Date(craving.at).getHours()
    byHour[hour] = (byHour[hour] ?? 0) + 1
    byIntensity[craving.intensity] += 1
  }
  const most = Math.max(...byHour)
  return {
    count: cravings.length,
    heldToEnd: cravings.filter((craving) => craving.heldToEnd).length,
    byHour,
    riskiestHour: most === 0 ? null : byHour.indexOf(most),
    byIntensity,
    byTag: tagCounts(cravings),
    untagged: cravings.filter((craving) => craving.tags.length === 0).length,
    trend: trendOf(cravings, journal.protocol, quitMoment, now),
  }
}
