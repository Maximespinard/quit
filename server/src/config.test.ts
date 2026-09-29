import { describe, expect, it } from 'vitest'
import { readConfig } from './config.ts'

const ENV = { DATA_DIR: '/data' }

describe('readConfig', () => {
  it('reads the data directory, with defaults for the rest', () => {
    expect(readConfig(ENV)).toEqual({
      port: 8080,
      dataDir: '/data',
      logLevel: 'info',
      trustProxyHops: 0,
    })
  })

  it('takes the port, the log level and the proxies when given', () => {
    const config = readConfig({ ...ENV, PORT: '3001', LOG_LEVEL: 'warn', TRUST_PROXY: '1' })

    expect([config.port, config.logLevel, config.trustProxyHops]).toEqual([3001, 'warn', 1])
  })

  it('takes the built app to serve when given, and nothing otherwise', () => {
    expect(readConfig({ ...ENV, APP_DIR: '/app/dist' }).appDir).toBe('/app/dist')
    expect(readConfig({ ...ENV, APP_DIR: '' })).not.toHaveProperty('appDir')
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
    ['a proxy count that is not a number', { TRUST_PROXY: 'true' }, 'TRUST_PROXY must be'],
  ])('refuses %s', (_, override, message) => {
    expect(() => readConfig({ ...ENV, ...override })).toThrow(message)
  })
})
