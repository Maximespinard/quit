import * as z from 'zod/mini'

/**
 * The facts a journal holds, one schema per type; their types are inferred from here and
 * nowhere else. A schema checks shape only: rules such as "not before the quit moment" live
 * in the app's domain (ADR-0002). A new fact type is one schema here plus its entry in
 * `factSchema`.
 */

/** An instant, in ms since the epoch. `z.number()` already refuses NaN and infinities. */
const instant = z.number()

export const QUIT_MOMENT = 'quit-moment'
export const CRAVING = 'craving'
export const PATCH_APPLICATION = 'patch-application'
export const LAPSE = 'lapse'

export const factTypeSchema = z.enum([QUIT_MOMENT, CRAVING, PATCH_APPLICATION, LAPSE])

/** The exact timestamp at which the user stopped smoking. */
export const quitMomentSchema = z.readonly(z.object({ type: z.literal(QUIT_MOMENT), at: instant }))
export type QuitMomentFact = z.infer<typeof quitMomentSchema>

export const CRAVING_INTENSITIES = [1, 2, 3] as const
export const cravingIntensitySchema = z.literal(CRAVING_INTENSITIES)
export type CravingIntensity = z.infer<typeof cravingIntensitySchema>

/** A craving the user chose to log, rated 1 to 3. Not a lapse. */
export const cravingSchema = z.readonly(
  z.object({
    type: z.literal(CRAVING),
    /** When the craving began: the timer's start, or a backdated moment. */
    at: instant,
    intensity: cravingIntensitySchema,
    /** True only when the craving timer ran to its end. */
    heldToEnd: z.boolean(),
    /**
     * The situation it arose in: default tag ids or the user's own words. Often empty; a
     * craving stored before tags existed carries none.
     */
    tags: z._default(z.readonly(z.array(z.string())), []),
  }),
)
export type CravingFact = z.infer<typeof cravingSchema>

/** Any positive dose, in mg: a cut patch gives a half dose. */
export const doseMgSchema = z.number().check(z.positive())

/**
 * The body areas a patch goes on, in the order the suggestion rotates through them. Stored by
 * id; their French labels live in the app's strings module.
 */
export const APPLICATION_SITES = [
  'arm-left',
  'arm-right',
  'chest-left',
  'chest-right',
  'hip-left',
  'hip-right',
] as const
export const applicationSiteSchema = z.enum(APPLICATION_SITES)
export type ApplicationSite = z.infer<typeof applicationSiteSchema>

/** A patch put on, at a given time and dose. The dose may differ from the step's. */
export const patchApplicationSchema = z.readonly(
  z.object({
    type: z.literal(PATCH_APPLICATION),
    at: instant,
    doseMg: doseMgSchema,
    /** Where it went on; absent when the user logged it without one, or before sites existed. */
    site: z.exactOptional(applicationSiteSchema),
  }),
)
export type PatchApplicationFact = z.infer<typeof patchApplicationSchema>

/** A whole number of cigarettes, at least one. */
export const lapseCountSchema = z.int().check(z.minimum(1))

/**
 * Any smoke inhaled after the quit moment, as one episode. No threshold: one puff is a lapse.
 * A lapse stored before it had a count reads as one cigarette.
 */
export const lapseSchema = z.readonly(
  z.object({ type: z.literal(LAPSE), at: instant, count: z._default(lapseCountSchema, 1) }),
)
export type LapseFact = z.infer<typeof lapseSchema>

export const factSchema = z.discriminatedUnion('type', [
  quitMomentSchema,
  cravingSchema,
  patchApplicationSchema,
  lapseSchema,
])
export type Fact = z.infer<typeof factSchema>
