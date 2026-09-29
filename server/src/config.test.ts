import { describe, expect, it } from 'vitest'
import { readConfig } from './config.ts'

const ENV = { DATA_DIR: '/data' }

describe('readConfig', () => {
  it('reads the data directory, with defaults for the rest', () => {
    expect(readConfig(ENV)).toEqual({ port: 8080, dataDir: '/data', logLevel: 'info' })
  })

  it('takes the port and the log level when given', () => {
    const config = readConfig({ ...ENV, PORT: '3001', LOG_LEVEL: 'warn' })

    expect([config.port, config.logLevel]).toEqual([3001, 'warn'])
  })

  it('names every invalid variable at once', () => {
    expect(() => readConfig({ PORT: '0', LOG_LEVEL: 'loud' })).toThrow(
      'Invalid configuration: DATA_DIR is missing; PORT must be an integer between 1 and ' +
        '65535; LOG_LEVEL must be one of fatal, error, warn, info, debug, trace, silent',
    )
  })

  it.each([
    ['an empty data directory', { DATA_DIR: '' }, 'DATA_DIR is missing'],
    ['a port that is not a number', { PORT: 'eighty' }, 'PORT must be an integer'],
    ['a port out of range', { PORT: '70000' }, 'PORT must be an integer'],
    ['an unknown log level', { LOG_LEVEL: 'verbose' }, 'LOG_LEVEL must be one of'],
  ])('refuses %s', (_, override, message) => {
    expect(() => readConfig({ ...ENV, ...override })).toThrow(message)
  })
})
