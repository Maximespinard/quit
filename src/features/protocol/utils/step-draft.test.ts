import { draftsFrom, moveDraft, type StepDraft, stepFrom } from './step-draft'

describe('draftsFrom', () => {
  it('turns each step into editable text, the brand empty when absent', () => {
    expect(
      draftsFrom([
        { doseMg: 3.5, durationDays: 7, brand: 'Niquitin' },
        { doseMg: 21, durationDays: 28 },
      ]),
    ).toEqual([
      { id: 0, dose: '3,5', duration: '7', brand: 'Niquitin' },
      { id: 1, dose: '21', duration: '28', brand: '' },
    ])
  })
})

describe('stepFrom', () => {
  it('reads a French decimal comma', () => {
    expect(stepFrom({ id: 0, dose: '3,5', duration: '7', brand: '' })).toEqual({
      doseMg: 3.5,
      durationDays: 7,
      brand: '',
    })
  })

  it('reads blank or unreadable numbers as invalid ones, for the domain to refuse', () => {
    const step = stepFrom({ id: 0, dose: ' ', duration: 'deux', brand: '' })

    expect(step.doseMg).toBe(0)
    expect(step.durationDays).toBeNaN()
  })
})

describe('moveDraft', () => {
  const drafts = draftsFrom([
    { doseMg: 21, durationDays: 28 },
    { doseMg: 14, durationDays: 14 },
    { doseMg: 7, durationDays: 14 },
  ])
  const doses = (list: readonly StepDraft[]) => list.map((draft) => draft.dose)

  it('moves a step up or down by one place', () => {
    expect(doses(moveDraft(drafts, 2, -1))).toEqual(['21', '7', '14'])
    expect(doses(moveDraft(drafts, 0, 1))).toEqual(['14', '21', '7'])
  })

  it('leaves the list as is past either end', () => {
    expect(moveDraft(drafts, 0, -1)).toBe(drafts)
    expect(moveDraft(drafts, 2, 1)).toBe(drafts)
  })
})
