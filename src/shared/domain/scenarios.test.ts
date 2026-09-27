import { decodeJournal } from './journal'
import { isScenarioId, scenarioById, scenarios } from './scenarios'

describe('scenarios', () => {
  it('names each scenario once', () => {
    const ids = scenarios.map((scenario) => scenario.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(scenarios.map((scenario) => [scenario.id, scenario] as const))(
    '%s holds only facts the journal decoder recognises',
    (_, scenario) => {
      expect(decodeJournal(scenario.journal)).toEqual(scenario.journal)
    },
  )

  it.each(scenarios.map((scenario) => [scenario.id, scenario] as const))(
    '%s dates every fact at or before its clock, in the order they happened',
    (_, scenario) => {
      const instants = scenario.journal.facts.map((fact) => fact.at)

      expect(Math.max(...instants)).toBeLessThanOrEqual(scenario.now)
      expect(instants).toEqual([...instants].sort((a, b) => a - b))
    },
  )

  it('finds a scenario by its id and recognises only known ids', () => {
    expect(scenarioById('day-29').id).toBe('day-29')
    expect(isScenarioId('day-29')).toBe(true)
    expect(isScenarioId('day-30')).toBe(false)
    expect(isScenarioId(29)).toBe(false)
  })
})
