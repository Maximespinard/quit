import type { CalendarDay } from '@/shared/domain/patch-calendar'
import { defaultProtocol } from '@/shared/domain/protocol'
import { describeDay, formatMonth } from './calendar-dates'

const day = (overrides: Partial<CalendarDay>): CalendarDay => ({
  day: new Date(2026, 0, 29).getTime(),
  step: 2,
  stepStart: false,
  patch: 'logged',
  cigarettes: 0,
  cravings: 0,
  today: false,
  end: false,
  ...overrides,
})

describe('describeDay', () => {
  it('reads a plain day as its date and its patch application', () => {
    expect(describeDay(day({}), defaultProtocol)).toBe('jeudi 29 janvier, patch posé')
  })

  it('reads everything a busy day holds', () => {
    expect(
      describeDay(
        day({ today: true, stepStart: true, patch: 'due', cigarettes: 2, cravings: 1 }),
        defaultProtocol,
      ),
    ).toBe(
      'jeudi 29 janvier, aujourd’hui, début de l’étape 2 à 14 mg, patch à poser, 2 cigarettes, 1 envie',
    )
  })

  it('reads the end of the protocol with no patch', () => {
    expect(describeDay(day({ step: null, patch: null, end: true }), defaultProtocol)).toBe(
      'jeudi 29 janvier, fin du protocole',
    )
  })
})

describe('formatMonth', () => {
  it('titles a month with its year', () => {
    expect(formatMonth(new Date(2026, 0, 1).getTime())).toBe('Janvier 2026')
  })
})
