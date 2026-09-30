import { gradientLength } from './chart-gradient'

describe('chart gradient', () => {
  it('stretches a bar’s gradient over the whole scale, so only the tallest reaches its end', () => {
    expect(gradientLength(35, 35)).toBe('100%')
    expect(gradientLength(7, 35)).toBe('500%')
    expect(gradientLength(1, 3)).toBe('300%')
  })

  it('leaves the gradient unstretched for an empty bar or an empty scale', () => {
    expect(gradientLength(0, 35)).toBe('100%')
    expect(gradientLength(0, 0)).toBe('100%')
  })
})
