import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import { stepStatus } from './step-status'

const secondStepRunning: ProtocolPosition = {
  status: 'running',
  stepNumber: 2,
  stepCount: 3,
  step: { doseMg: 14, durationDays: 28 },
  dayInStep: 17,
  daysLeft: 12,
  endsAt: 0,
  nextStep: { doseMg: 7, durationDays: 28 },
}

describe('stepStatus', () => {
  it('places each step in force around the running one', () => {
    expect([0, 1, 2].map((id) => stepStatus(secondStepRunning, id, 3))).toEqual([
      'past',
      'current',
      'upcoming',
    ])
  })

  it('reads every step in force as past once the protocol is over', () => {
    expect([0, 1, 2].map((id) => stepStatus({ status: 'over' }, id, 3))).toEqual([
      'past',
      'past',
      'past',
    ])
  })

  it('leaves a step added in the editor upcoming, even after the protocol is over', () => {
    expect(stepStatus({ status: 'over' }, 3, 3)).toBe('upcoming')
    expect(stepStatus(secondStepRunning, 3, 3)).toBe('upcoming')
  })

  it('places nothing before the quit moment is set', () => {
    expect(stepStatus(null, 0, 3)).toBe('upcoming')
  })
})
