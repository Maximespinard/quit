import { describe, expect, it } from 'vitest'
import webPush from 'web-push'
import { readConfig } from './config.ts'

const VAPID = webPush.generateVAPIDKeys()
const ENV = {
  DATA_DIR: '/data',
  VAPID_SUBJECT: 'mailto:owner@example.com',
  VAPID_PUBLIC_KEY: VAPID.publicKey,
  VAPID_PRIVATE_KEY: VAPID.privateKey,
}

describe('readConfig', () => {
  it('reads the data directory and the VAPID keys, with defaults for the rest', () => {
    expect(readConfig(ENV)).toEqual({
      port: 8080,
      dataDir: '/data',
      logLevel: 'info',
      trustProxyHops: 0,
      vapid: {
        subject: 'mailto:owner@example.com',
        publicKey: VAPID.publicKey,
        privateKey: VAPID.privateKey,
      },
    })
  })

  it('takes the port, the log level and the proxies when given', () => {
    const config = readConfig({ ...ENV, PORT: '3001', LOG_LEVEL: 'warn', TRUST_PROXY: '1' })

    expect([config.port, config.logLevel, config.trustProxyHops]).toEqual([3001, 'warn', 1])
  })

  it('names every invalid variable at once', () => {
    expect(() => readConfig({ PORT: '0', LOG_LEVEL: 'loud' })).toThrow(
      'Invalid configuration: DATA_DIR is missing; PORT must be an integer between 1 and ' +
        '65535; LOG_LEVEL must be one of fatal, error, warn, info, debug, trace, silent; ' +
        'VAPID_SUBJECT is missing; VAPID_PUBLIC_KEY is missing; VAPID_PRIVATE_KEY is missing',
    )
  })

  it.each([
    ['an empty data directory', { DATA_DIR: '' }, 'DATA_DIR is missing'],
    ['a port that is not a number', { PORT: 'eighty' }, 'PORT must be an integer'],
    ['a port out of range', { PORT: '70000' }, 'PORT must be an integer'],
    ['an unknown log level', { LOG_LEVEL: 'verbose' }, 'LOG_LEVEL must be one of'],
    ['a proxy count that is not a number', { TRUST_PROXY: 'true' }, 'TRUST_PROXY must be'],
    ['a subject Apple rejects', { VAPID_SUBJECT: 'owner@example.com' }, 'mailto: or https://'],
    [
      'the private key in place of the public one',
      { VAPID_PUBLIC_KEY: VAPID.privateKey },
      'VAPID_PUBLIC_KEY must be 65 bytes in base64url',
    ],
    [
      'a private key that is not base64url',
      { VAPID_PRIVATE_KEY: `${VAPID.privateKey.slice(0, -1)}=` },
      'VAPID_PRIVATE_KEY must be 32 bytes in base64url',
    ],
  ])('refuses %s', (_, override, message) => {
    expect(() => readConfig({ ...ENV, ...override })).toThrow(message)
  })
})
