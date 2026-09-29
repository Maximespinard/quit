import type { CalendarDay } from '@/shared/domain/patch-calendar'
import { defaultProtocol } from '@/shared/domain/protocol'
import { describeDay, formatMonth } from './calendar-dates'

const day = (overrides: Partial<CalendarDay>): CalendarDay => ({
  day: new Date(2026, 0, 29).getTime(),
  step: 2,
  startingStep: null,
  patch: 'logged',
  cigarettes: 0,
  cravings: 0,
  isToday: false,
  isEnd: false,
  ...overrides,
})

describe('describeDay', () => {
  it('reads a plain day as its date and its patch application', () => {
    expect(describeDay(day({}))).toBe('jeudi 29 janvier, patch posé')
  })

  it('reads everything a busy day holds', () => {
    expect(
      describeDay(
        day({
          isToday: true,
          startingStep: defaultProtocol[1] ?? null,
          patch: 'due',
          cigarettes: 2,
          cravings: 1,
        }),
      ),
    ).toBe(
      'jeudi 29 janvier, aujourd’hui, début de l’étape 2 à 14 mg, patch à poser, 2 cigarettes, 1 envie',
    )
  })

  it('reads the end of the protocol with no patch', () => {
    expect(describeDay(day({ step: null, patch: null, isEnd: true }))).toBe(
      'jeudi 29 janvier, fin du protocole',
    )
  })
})

describe('formatMonth', () => {
  it('titles a month with its year', () => {
    expect(formatMonth(new Date(2026, 0, 1).getTime())).toBe('Janvier 2026')
  })
})
