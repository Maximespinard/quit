import { execFileSync } from 'node:child_process'
import { createECDH } from 'node:crypto'
import { join } from 'node:path'

/**
 * The API the e2e suite runs beside the preview build: the real server, on its own port and
 * data directory per e2e slot, reached by the app through the preview's `/api` proxy.
 */

const appPort = Number(process.env.E2E_PORT ?? '4173')

export const apiPort = appPort + 1000
export const apiUrl = `http://127.0.0.1:${apiPort}`
/** Wiped each time the suite starts the server: every run begins with an empty mirror. */
export const apiDataDir = join(process.cwd(), 'node_modules', '.tmp', `e2e-api-${apiPort}`)

/** A throwaway VAPID pair: the server refuses to start without one, and e2e sends no push. */
function throwawayVapidKeys() {
  const ecdh = createECDH('prime256v1')
  // A private scalar with leading zero bytes comes out shorter than the 32 the server checks.
  do ecdh.generateKeys()
  while (ecdh.getPrivateKey().length !== 32)
  return {
    VAPID_PUBLIC_KEY: ecdh.getPublicKey().toString('base64url'),
    VAPID_PRIVATE_KEY: ecdh.getPrivateKey().toString('base64url'),
  }
}

export const apiEnv = {
  PORT: String(apiPort),
  DATA_DIR: apiDataDir,
  LOG_LEVEL: 'warn',
  VAPID_SUBJECT: 'mailto:e2e@example.invalid',
  ...throwawayVapidKeys(),
}

/** Issues a new device key, as the maintainer does on the server; the previous one is revoked. */
export const issueDeviceKey = () =>
  execFileSync('node', ['server/src/issue-device-key.ts'], {
    env: { ...process.env, ...apiEnv },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
