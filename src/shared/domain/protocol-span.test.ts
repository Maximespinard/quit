import type { Protocol } from '@quit/contract/settings'
import { local } from '@/shared/test/local-time'
import { asksForPatch, protocolSpan } from './protocol-span'

// An evening quit: Sunday 20 September, 20:00; three protocol days end on the 23rd at 20:00.
const QUIT = local(9, 20, 20)
const SHORT: Protocol = [{ doseMg: 7, durationDays: 3 }]

describe('protocolSpan', () => {
  it('opens on the day holding the quit moment and closes on the day the last step ends', () => {
    expect(protocolSpan(SHORT, QUIT)).toEqual({ quitDay: local(9, 20), endDay: local(9, 23) })
  })

  it('closes on the day the planned end falls on across the autumn daylight-saving change', () => {
    // 25 October 2026 lasts 25 h: seven 24 h blocks from 00:30 on the 20th end at 23:30 on the 26th.
    const week: Protocol = [{ doseMg: 7, durationDays: 7 }]

    expect(protocolSpan(week, local(10, 20, 0, 30)).endDay).toBe(local(10, 26))
  })
})

describe('asksForPatch', () => {
  const span = protocolSpan(SHORT, QUIT)

  it('asks nothing on the quit day: a patch put on before the quit moment cannot be recorded', () => {
    expect(asksForPatch(local(9, 20), span)).toBe(false)
  })

  it('asks for one patch on each day between the quit day and the end day', () => {
    expect(asksForPatch(local(9, 21), span)).toBe(true)
    expect(asksForPatch(local(9, 22), span)).toBe(true)
  })

  it('asks nothing from the end day on: the last patch comes off', () => {
    expect(asksForPatch(local(9, 23), span)).toBe(false)
    expect(asksForPatch(local(9, 30), span)).toBe(false)
  })
})
