export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const
export type LogLevel = (typeof LOG_LEVELS)[number]

export interface Config {
  port: number
  /** Holds the SQLite database; created when missing. */
  dataDir: string
  logLevel: LogLevel
}

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

  if (problems.length > 0 || !logLevel) {
    throw new Error(`Invalid configuration: ${problems.join('; ')}`)
  }
  return { port, dataDir, logLevel }
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
