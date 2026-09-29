import type { VapidDetails } from './push/web-push-transport.ts'

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const
export type LogLevel = (typeof LOG_LEVELS)[number]

export interface Config {
  port: number
  /** Holds the SQLite database; created when missing. */
  dataDir: string
  logLevel: LogLevel
  /** Reverse proxies between the clients and the server; 0 when clients connect directly. */
  trustProxyHops: number
  /** The built PWA to serve next to the API; the API alone when absent. */
  appDir?: string
  /** Identifies this server to the push services. */
  vapid: VapidDetails
}

/** VAPID keys are P-256: an uncompressed public point and a private scalar, in base64url. */
const VAPID_KEY_BYTES = { VAPID_PUBLIC_KEY: 65, VAPID_PRIVATE_KEY: 32 } as const

const isBase64UrlOfLength = (value: string, bytes: number) =>
  /^[\w-]+$/.test(value) && Buffer.from(value, 'base64url').length === bytes

/**
 * Reads the configuration from the environment; throws one error naming every variable that
 * is missing or invalid.
 */
export function readConfig(env: Record<string, string | undefined>): Config {
  const problems: string[] = []

  const dataDir = env.DATA_DIR ?? ''
  if (!dataDir) problems.push('DATA_DIR is missing')

  const port = Number(env.PORT ?? '8080')
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    problems.push('PORT must be an integer between 1 and 65535')
  }

  const logLevel = LOG_LEVELS.find((level) => level === (env.LOG_LEVEL ?? 'info'))
  if (!logLevel) problems.push(`LOG_LEVEL must be one of ${LOG_LEVELS.join(', ')}`)

  const trustProxyHops = Number(env.TRUST_PROXY ?? '0')
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    problems.push('TRUST_PROXY must be a whole number of proxies')
  }

  const subject = env.VAPID_SUBJECT ?? ''
  if (!subject) problems.push('VAPID_SUBJECT is missing')
  else if (!/^(mailto:|https:\/\/)/.test(subject)) {
    problems.push('VAPID_SUBJECT must be a mailto: or https:// URL')
  }
  const vapidKey = (name: keyof typeof VAPID_KEY_BYTES) => {
    const value = env[name] ?? ''
    if (!value) problems.push(`${name} is missing`)
    else if (!isBase64UrlOfLength(value, VAPID_KEY_BYTES[name])) {
      problems.push(`${name} must be ${VAPID_KEY_BYTES[name]} bytes in base64url`)
    }
    return value
  }
  const vapid = {
    subject,
    publicKey: vapidKey('VAPID_PUBLIC_KEY'),
    privateKey: vapidKey('VAPID_PRIVATE_KEY'),
  }

  // `!logLevel` is already a problem; repeated here so TypeScript narrows it.
  if (problems.length > 0 || !logLevel) {
    throw new Error(`Invalid configuration: ${problems.join('; ')}`)
  }
  const appDir = env.APP_DIR ?? ''
  return { port, dataDir, logLevel, trustProxyHops, vapid, ...(appDir ? { appDir } : {}) }
}

/** `readConfig` for an entry point: on invalid configuration, prints why and exits. */
export function readConfigOrExit(env: Record<string, string | undefined>): Config {
  try {
    return readConfig(env)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
