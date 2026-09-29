import { describe, expect, it } from 'vitest'
import { problemSchema } from './problem.ts'

const PROBLEM = {
  type: 'about:blank',
  title: 'Unauthorized',
  status: 401,
  detail: 'A valid device key is required.',
}

describe('problemSchema', () => {
  it('reads a problem, with or without detail', () => {
    const { detail: _, ...withoutDetail } = PROBLEM

    expect(problemSchema.parse(PROBLEM)).toEqual(PROBLEM)
    expect(problemSchema.parse(withoutDetail)).toEqual(withoutDetail)
  })

  it.each([
    ['a success status', { ...PROBLEM, status: 200 }],
    ['a missing title', { ...PROBLEM, title: undefined }],
  ])('refuses %s', (_, body) => {
    expect(problemSchema.safeParse(body).success).toBe(false)
  })
})
