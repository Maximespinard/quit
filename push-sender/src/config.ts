import type { VapidDetails } from './web-push-transport.ts'

export interface Config {
  port: number
  dataFile: string
  sharedSecret: string
  vapid: VapidDetails
}

const MIN_SECRET_LENGTH = 32

/** Reads the configuration from the environment; throws one error listing every problem. */
export function readConfig(env: Record<string, string | undefined>): Config {
  const problems: string[] = []
  const required = (name: string) => {
    const value = env[name]
    if (!value) problems.push(`${name} is missing`)
    return value ?? ''
  }

  const sharedSecret = required('PUSH_SHARED_SECRET')
  const vapid = {
    subject: required('VAPID_SUBJECT'),
    publicKey: required('VAPID_PUBLIC_KEY'),
    privateKey: required('VAPID_PRIVATE_KEY'),
  }
  const port = Number(env.PORT ?? '8080')

  if (sharedSecret && sharedSecret.length < MIN_SECRET_LENGTH) {
    problems.push(`PUSH_SHARED_SECRET must be at least ${MIN_SECRET_LENGTH} characters`)
  }
  if (vapid.subject && !/^(mailto:|https:\/\/)/.test(vapid.subject)) {
    problems.push('VAPID_SUBJECT must be a mailto: or https:// URL')
  }
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    problems.push('PORT must be an integer between 1 and 65535')
  }
  if (problems.length > 0) throw new Error(`Invalid configuration: ${problems.join('; ')}`)

  return { port, dataFile: env.DATA_FILE ?? '/data/state.json', sharedSecret, vapid }
}
