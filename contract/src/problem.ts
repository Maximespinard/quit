import * as z from 'zod/mini'

/**
 * The server's error format: RFC 9457 problem details, sent as `application/problem+json`
 * for every error answer. `type` stays `about:blank`: the status and its title say what
 * went wrong, `detail` says it for this request.
 */
export const PROBLEM_CONTENT_TYPE = 'application/problem+json'

export const problemSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.int().check(z.gte(400), z.lte(599)),
  detail: z.optional(z.string()),
})
export type Problem = z.infer<typeof problemSchema>
