import { type ChildProcess, execFile, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, request } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'
import webPush from 'web-push'
import { DATABASE_FILE } from './db/database.ts'

/**
 * The entry points as the container runs them: `node src/main.ts` and the issue command, in
 * child processes against a temporary data directory.
 */

/** Each test starts Node processes: generous against a loaded machine. */
const TIMEOUT = { timeout: 20_000 }

const SERVER = join(import.meta.dirname, 'main.ts')
const ISSUE_COMMAND = join(import.meta.dirname, 'issue-device-key.ts')

const children: ChildProcess[] = []
const dirs: string[] = []

afterEach(async () => {
  for (const child of children.splice(0)) child.kill('SIGKILL')
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function dataDir() {
  const dir = await mkdtemp(join(tmpdir(), 'quit-server-'))
  dirs.push(dir)
  return dir
}

async function freePort() {
  const probe = createServer()
  await new Promise<void>((resolve) => probe.listen(0, '127.0.0.1', resolve))
  const { port } = probe.address() as AddressInfo
  await new Promise((resolve) => probe.close(resolve))
  return port
}

const VAPID = webPush.generateVAPIDKeys()

/** A valid VAPID configuration, then `env`. */
const envFor = (env: Record<string, string>) => ({
  PATH: process.env.PATH ?? '',
  VAPID_SUBJECT: 'mailto:owner@example.com',
  VAPID_PUBLIC_KEY: VAPID.publicKey,
  VAPID_PRIVATE_KEY: VAPID.privateKey,
  ...env,
})

async function issueKey(dir: string) {
  const { stdout } = await promisify(execFile)(process.execPath, [ISSUE_COMMAND], {
    env: envFor({ DATA_DIR: dir }),
  })
  return stdout
}

interface LogLine {
  msg: string
  res?: { statusCode: number }
}

/** Starts the server and resolves once it listens; `logs` keeps filling as it runs. */
async function startServer(dir: string) {
  const port = await freePort()
  const child = spawn(process.execPath, [SERVER], {
    env: envFor({ DATA_DIR: dir, PORT: String(port) }),
  })
  children.push(child)
  const logs: LogLine[] = []
  const exited = new Promise<number | null>((resolve) => child.once('exit', resolve))
  const waiters: { msg: string; resolve: () => void }[] = []
  createInterface({ input: child.stdout }).on('line', (line) => {
    const entry: LogLine = JSON.parse(line)
    logs.push(entry)
    for (const waiter of waiters.filter((w) => w.msg === entry.msg)) waiter.resolve()
  })
  const logged = (msg: string) =>
    logs.some((entry) => entry.msg === msg)
      ? Promise.resolve()
      : new Promise<void>((resolve) => waiters.push({ msg, resolve }))

  await logged('listening')
  const get = (path: string, key: string) =>
    fetch(`http://127.0.0.1:${port}${path}`, { headers: { authorization: `Bearer ${key}` } })
  return { child, port, logs, logged, exited, get }
}

describe('configuration', TIMEOUT, () => {
  it.each([
    ['a missing data directory', {}, 'DATA_DIR is missing'],
    ['an invalid port', { DATA_DIR: 'unused', PORT: 'eighty' }, 'PORT must be an integer'],
  ])('refuses to start with %s, naming the variable', async (_, env, message) => {
    const child = spawn(process.execPath, [SERVER], { env: envFor(env) })
    children.push(child)
    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })

    const code = await new Promise((resolve) => child.once('exit', resolve))

    expect(code).toBe(1)
    expect(stderr).toContain(message)
  })
})

describe('issue command', TIMEOUT, () => {
  it('prints a key once, which the running server accepts, and revokes the previous one', async () => {
    const dir = await dataDir()
    const first = (await issueKey(dir)).trim()
    const server = await startServer(dir)
    const beforeSecond = await server.get('/api/nothing-here', first)

    const output = await issueKey(dir)
    const second = output.trim()

    expect(output).toMatch(/^[\w-]{43}\n$/)
    expect(beforeSecond.status).toBe(404)
    expect((await server.get('/api/nothing-here', first)).status).toBe(401)
    expect((await server.get('/api/nothing-here', second)).status).toBe(404)
  })
})

describe('SIGTERM', TIMEOUT, () => {
  it('lets an in-flight request finish, then closes the database and exits', async () => {
    const dir = await dataDir()
    const key = (await issueKey(dir)).trim()
    const server = await startServer(dir)
    const body = JSON.stringify({ note: 'sent in two parts' })

    // Headers and half the body now, the rest once the server is shutting down.
    const inFlight = request({
      host: '127.0.0.1',
      port: server.port,
      method: 'PUT',
      path: '/api/nothing-here',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    })
    const status = new Promise<number | undefined>((resolve, reject) => {
      inFlight.once('response', (response) => {
        response.resume()
        resolve(response.statusCode)
      })
      inFlight.once('error', reject)
    })
    inFlight.write(body.slice(0, 10))
    await new Promise((resolve) => setTimeout(resolve, 200))
    server.child.kill('SIGTERM')
    await server.logged('shutting down')
    inFlight.end(body.slice(10))

    expect(await status).toBe(404)
    expect(await server.exited).toBe(0)
    const messages = server.logs.map((entry) => entry.msg)
    expect(messages.indexOf('request completed')).toBeLessThan(messages.indexOf('database closed'))
    // SQLite folds the write-ahead log back into the database when the last connection closes.
    expect(existsSync(join(dir, `${DATABASE_FILE}-wal`))).toBe(false)
  })
})
