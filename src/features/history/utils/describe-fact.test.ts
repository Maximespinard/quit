import { describeFact } from './describe-fact'

it('says a patch application with its dose', () => {
  expect(describeFact({ type: 'patch-application', at: 0, doseMg: 10.5 })).toEqual({
    title: 'Patch posé',
    detail: '10,5 mg',
  })
})

it('says a patch application’s site after its dose', () => {
  expect(describeFact({ type: 'patch-application', at: 0, doseMg: 14, site: 'hip-left' })).toEqual({
    title: 'Patch posé',
    detail: '14 mg · Hanche gauche',
  })
})

it('says a craving with its intensity and its tags, default ones by their label', () => {
  expect(
    describeFact({
      type: 'craving',
      at: 0,
      intensity: 3,
      heldToEnd: false,
      tags: ['coffee', 'Voiture'],
    }),
  ).toEqual({ title: 'Envie', detail: 'Intensité 3 · Café, Voiture' })
})

it('says when a craving was held to the end of the timer', () => {
  expect(describeFact({ type: 'craving', at: 0, intensity: 1, heldToEnd: true, tags: [] })).toEqual(
    { title: 'Envie tenue jusqu’au bout', detail: 'Intensité 1' },
  )
})

it('says a lapse with its cigarettes', () => {
  expect(describeFact({ type: 'lapse', at: 0, count: 1 })).toEqual({
    title: 'J’ai fumé',
    detail: '1 cigarette',
  })
  expect(describeFact({ type: 'lapse', at: 0, count: 4 }).detail).toBe('4 cigarettes')
})
