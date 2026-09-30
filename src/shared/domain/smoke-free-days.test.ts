import { local } from '@/shared/test/local-time'
import { smokeFreeDays } from './smoke-free-days'

const HOUR = 60 * 60_000

/** Smoke-free days at `now`, each lapse one cigarette. */
const daysAt = (quitMoment: number, now: number, lapses: readonly number[] = []) =>
  smokeFreeDays(
    quitMoment,
    lapses.map((at) => ({ at, count: 1 })),
    now,
  )

describe('smokeFreeDays', () => {
  it('counts each whole local day after the quit moment, once it is over', () => {
    // Quit on day 1 at 20:00: day 1 had smoke before the quit moment, day 4 is not over.
    expect(daysAt(local(1, 1, 20), local(1, 4, 10))).toBe(2)
  })

  it('counts the quit day when the quit moment is its very first instant', () => {
    expect(daysAt(local(1, 1), local(1, 2))).toBe(1)
    expect(daysAt(local(1, 1, 0, 1), local(1, 2))).toBe(0)
  })

  it('adds a day exactly at midnight, not a millisecond before', () => {
    const quitMoment = local(1, 1, 20)

    expect(daysAt(quitMoment, local(1, 4) - 1)).toBe(1)
    expect(daysAt(quitMoment, local(1, 4))).toBe(2)
  })

  it('does not count day 12 when a lapse happened on it at 23:00', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 20, 10)

    expect(daysAt(quitMoment, now)).toBe(18)
    expect(daysAt(quitMoment, now, [local(1, 12, 23)])).toBe(17)
  })

  it('puts a lapse at midnight on the day it opens', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 14)

    // Day 12 stays smoke-free; day 13 does not.
    expect(daysAt(quitMoment, now, [local(1, 13)])).toBe(11)
    expect(daysAt(quitMoment, local(1, 13), [local(1, 13)])).toBe(11)
  })

  it('removes a day once however many lapses it holds', () => {
    const lapses = [local(1, 12, 9), local(1, 12, 23)]

    expect(daysAt(local(1, 1, 20), local(1, 20, 10), lapses)).toBe(17)
  })

  it('takes nothing more away for a lapse on a quit day that never counted', () => {
    expect(daysAt(local(1, 1, 8), local(1, 5, 10), [local(1, 1, 21)])).toBe(3)
  })

  it('takes the quit day away when it had counted', () => {
    expect(daysAt(local(1, 1), local(1, 3))).toBe(2)
    expect(daysAt(local(1, 1), local(1, 3), [local(1, 1, 21)])).toBe(1)
  })

  it('keeps the total when the streak restarts', () => {
    const quitMoment = local(1, 1, 20)
    const now = local(1, 20, 10)

    expect(daysAt(quitMoment, now, [now - HOUR])).toBe(18)
  })

  it('counts nothing while now is still before the quit moment', () => {
    expect(daysAt(local(1, 5), local(1, 3))).toBe(0)
  })

  it('follows the calendar across the spring daylight-saving change (23 h day)', () => {
    // 29 March 2026: clocks go from 02:00 to 03:00 in Europe/Paris.
    const quitMoment = local(3, 27, 20)

    expect(daysAt(quitMoment, local(3, 30))).toBe(2)
    expect(daysAt(quitMoment, local(3, 31, 10), [local(3, 29, 23, 30)])).toBe(2)
    expect(daysAt(quitMoment, local(3, 31, 10), [local(3, 30, 0, 30)])).toBe(2)
  })

  it('follows the calendar across the autumn daylight-saving change (25 h day)', () => {
    // 25 October 2026: clocks go from 03:00 back to 02:00 in Europe/Paris.
    const quitMoment = local(10, 23, 20)

    expect(daysAt(quitMoment, local(10, 26) - 1)).toBe(1)
    expect(daysAt(quitMoment, local(10, 26))).toBe(2)
    expect(daysAt(quitMoment, local(10, 27, 10), [local(10, 25, 23, 30)])).toBe(2)
  })
})
