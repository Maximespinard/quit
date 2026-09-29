import * as z from 'zod/mini'
import { doseMgSchema } from './facts.ts'

/**
 * The settings that shape what is derived from the facts: the protocol, the weekly spend, the
 * baseline and the goal. Money is in integer cents, everywhere.
 */

/** Integer cents, above zero. */
export const centsSchema = z.int().check(z.positive())

/** Whole days only: every patch is a 24 h patch. */
export const durationDaysSchema = z.int().check(z.positive())

/** One step of the protocol: a 24 h patch dose and how many days it lasts. */
export const stepSchema = z.readonly(
  z.object({
    doseMg: doseMgSchema,
    durationDays: durationDaysSchema,
    /** Free-text brand, noted by the user; absent rather than blank. */
    brand: z.exactOptional(z.string()),
  }),
)
export type Step = z.infer<typeof stepSchema>

/** The user-defined taper, in order. Never empty; a lapse never alters it. */
export const protocolSchema = z.readonly(z.array(stepSchema).check(z.minLength(1)))
export type Protocol = z.infer<typeof protocolSchema>

/** Weekly tobacco spend: money saved is computed from it. */
export const weeklySpendCentsSchema = centsSchema

/** Whole smokes, at least one a day: cigarettes not smoked are counted from it. */
export const baselineSmokesPerDaySchema = z.int().check(z.positive())

export const GOAL_LABEL_MAX_LENGTH = 60

/** Read trimmed; blank is no label. */
export const goalLabelSchema = z
  .string()
  .check(z.trim(), z.minLength(1), z.maxLength(GOAL_LABEL_MAX_LENGTH))

/** The one thing the user is saving towards. Its progress is derived, never stored. */
export const goalSchema = z.readonly(
  z.object({
    label: goalLabelSchema,
    priceCents: centsSchema,
    /**
     * Where its money saved starts counting: `null` for the quit moment, or the instant it
     * replaced a goal reached — that money went on the previous one. `null` when stored before
     * it existed.
     */
    countsFrom: z._default(z.nullable(z.number()), null),
    /**
     * Set once the celebration of the goal reached has been seen: it plays only once, and the
     * goal stays reached from then on. Not seen when stored before it existed.
     */
    celebrated: z._default(z.boolean(), false),
  }),
)
export type Goal = z.infer<typeof goalSchema>

/** Every setting at once; `null` is "not set yet", which first launch or the user fills in. */
export const settingsSchema = z.object({
  protocol: protocolSchema,
  weeklySpendCents: z.nullable(weeklySpendCentsSchema),
  baselineSmokesPerDay: z.nullable(baselineSmokesPerDaySchema),
  /** No goal is a valid answer, written `null` or left out. */
  goal: z._default(z.nullable(goalSchema), null),
})
export type Settings = z.infer<typeof settingsSchema>
