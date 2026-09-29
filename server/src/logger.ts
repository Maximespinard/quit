import { type DestinationStream, pino } from 'pino'
import type { LogLevel } from './config.ts'

export type { Logger } from 'pino'

/** JSON lines on stdout, or on `destination` (tests read them back). */
export const createLogger = (level: LogLevel, destination?: DestinationStream) =>
  pino({ level }, destination)
