import { describe, expect, it } from 'vitest'
import { cravingBucket } from './craving-bucket'

describe('cravingBucket', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 2],
    [5, 2],
    [6, 3],
    [14, 3],
  ])('puts %i cravings in bucket %i', (count, bucket) => {
    expect(cravingBucket(count)).toBe(bucket)
  })
})
