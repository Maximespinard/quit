import { factIdSchema } from '@quit/contract/facts'
import { newFactId, uuidv7 } from './fact-id'

const AT = Date.UTC(2026, 8, 29, 10, 0, 0)

describe('uuidv7', () => {
  it('writes the instant first, then the version, the variant and the random bits', () => {
    const random = Uint8Array.from([0xff, 0xff, 0xff, 1, 2, 3, 4, 5, 6, 7])

    expect(uuidv7(AT, random)).toBe('01a0ec9b-5d00-7fff-bf01-020304050607')
  })

  it('sorts by the instant it was made at', () => {
    const random = new Uint8Array(10)

    expect(uuidv7(AT, random) < uuidv7(AT + 1, random)).toBe(true)
  })
})

describe('newFactId', () => {
  it('gives a UUIDv7 the contract accepts, a new one each time', () => {
    const ids = Array.from({ length: 50 }, newFactId)

    expect(ids.every((id) => factIdSchema.safeParse(id).success)).toBe(true)
    expect(new Set(ids).size).toBe(50)
  })
})
