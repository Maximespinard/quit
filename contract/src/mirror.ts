import * as z from 'zod/mini'
import { factSchema } from './facts.ts'
import { settingsSchema } from './settings.ts'

/**
 * The mirror as the server answers it (ADR-0003): the facts it holds, each with its id, ordered
 * by time, and the settings — `null` until the device has sent them once. A restore rebuilds
 * the journal from it.
 */
export const mirrorSchema = z.object({
  facts: z.readonly(z.array(factSchema)),
  settings: z.nullable(settingsSchema),
})
export type Mirror = z.infer<typeof mirrorSchema>
