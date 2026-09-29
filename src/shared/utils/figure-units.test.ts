import { formatEuros } from './euros'
import { splitUnits } from './figure-units'

it('splits euros into the amount and its unit', () => {
  expect(splitUnits(formatEuros(22_008))).toEqual([
    { text: '220,08', unit: false },
    { text: ' €', unit: true },
  ])
})

it('keeps the thousands separator inside the amount', () => {
  expect(splitUnits(formatEuros(125_000))).toEqual([
    { text: '1 250', unit: false },
    { text: ' €', unit: true },
  ])
})

it('splits a duration into each figure and its unit', () => {
  expect(splitUnits('46 j 07 h')).toEqual([
    { text: '46', unit: false },
    { text: ' j', unit: true },
    { text: ' 07', unit: false },
    { text: ' h', unit: true },
  ])
})

it('splits percentages and hours, and leaves a bare count or a word whole', () => {
  expect(splitUnits('75 %')).toEqual([
    { text: '75', unit: false },
    { text: ' %', unit: true },
  ])
  expect(splitUnits('660')).toEqual([{ text: '660', unit: false }])
  expect(splitUnits('Café')).toEqual([{ text: 'Café', unit: false }])
})
