import * as z from 'zod/mini'
import { factSchema } from './facts.ts'
import { settingsSchema } from './settings.ts'

/**
 * The facts recorded by one person plus the settings that shape what is derived — the only
 * thing ever stored (ADR-0002). Never a derived value.
 */
export const journalSchema = z.readonly(
  z.extend(settingsSchema, { facts: z.readonly(z.array(factSchema)) }),
)
export type Journal = z.infer<typeof journalSchema>
