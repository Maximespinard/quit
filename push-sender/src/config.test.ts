import { describe, expect, it } from 'vitest'
import { readConfig } from './config.ts'

const ENV = {
  PUSH_SHARED_SECRET: 'a-shared-secret-of-at-least-32-characters',
  VAPID_SUBJECT: 'mailto:owner@example.com',
  VAPID_PUBLIC_KEY: 'BPublicKey',
  VAPID_PRIVATE_KEY: 'fake-vapid-key',
}

describe('readConfig', () => {
  it('reads the secrets from the environment, with defaults for the rest', () => {
    expect(readConfig(ENV)).toEqual({
      port: 8080,
      dataFile: '/data/state.json',
      sharedSecret: ENV.PUSH_SHARED_SECRET,
      vapid: {
        subject: ENV.VAPID_SUBJECT,
        publicKey: ENV.VAPID_PUBLIC_KEY,
        privateKey: ENV.VAPID_PRIVATE_KEY,
      },
    })
  })

  it('takes the port and the state file location when given', () => {
    const config = readConfig({ ...ENV, PORT: '3001', DATA_FILE: './data/state.json' })

    expect([config.port, config.dataFile]).toEqual([3001, './data/state.json'])
  })

  it('lists every missing variable at once', () => {
    expect(() => readConfig({})).toThrow(
      'Invalid configuration: PUSH_SHARED_SECRET is missing; VAPID_SUBJECT is missing; ' +
        'VAPID_PUBLIC_KEY is missing; VAPID_PRIVATE_KEY is missing',
    )
  })

  it.each([
    ['a short secret', { PUSH_SHARED_SECRET: 'short' }, 'at least 32 characters'],
    ['a subject Apple rejects', { VAPID_SUBJECT: 'owner@example.com' }, 'mailto: or https://'],
    ['an invalid port', { PORT: 'eighty' }, 'PORT must be an integer'],
  ])('refuses %s', (_, override, message) => {
    expect(() => readConfig({ ...ENV, ...override })).toThrow(message)
  })
})
