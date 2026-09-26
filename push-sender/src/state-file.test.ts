import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createStateFile } from './state-file.ts'
import type { State } from './types.ts'

const STATE: State = {
  subscription: {
    endpoint: 'https://web.push.apple.com/phone-1',
    expirationTime: null,
    keys: { p256dh: 'BPhone1p256dhKey', auth: 'phone1-auth' },
  },
  schedule: [
    { sendAt: Date.parse('2026-10-01T08:00:00Z'), title: 'A', body: 'Body of A', screen: '/' },
  ],
}

let dir: string

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'push-sender-state-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('state file', () => {
  it('starts empty when the file does not exist yet', async () => {
    const stateFile = createStateFile(join(dir, 'nested', 'state.json'))

    expect(await stateFile.load()).toEqual({ subscription: null, schedule: [] })
  })

  it('loads what was saved, creating the folder if needed', async () => {
    const path = join(dir, 'nested', 'state.json')

    await createStateFile(path).save(STATE)

    expect(await createStateFile(path).load()).toEqual(STATE)
  })

  it.each([
    ['a truncated file', '{"subscription":null,"sche'],
    ['an empty file', ''],
    ['a file that is not a state', '{"subscription":"phone"}'],
  ])('refuses %s instead of starting empty', async (_, content) => {
    const path = join(dir, 'state.json')
    await writeFile(path, content)

    await expect(createStateFile(path).load()).rejects.toThrow(
      `State file ${path} is not a valid push sender state`,
    )
  })
})
