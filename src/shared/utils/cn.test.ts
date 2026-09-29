import { themeTokens } from '@/shared/test/theme-tokens'
import { cn } from './cn'

describe('cn, on the theme tokens', () => {
  it.each([...themeTokens('radius').keys()])('lets rounded-%s replace another radius', (name) => {
    expect(cn('rounded-full', `rounded-${name}`)).toBe(`rounded-${name}`)
    expect(cn(`rounded-${name}`, 'rounded-full')).toBe('rounded-full')
  })

  it.each([...themeTokens('text').keys()])('reads text-%s as a size, never a colour', (name) => {
    expect(cn('text-body', `text-${name}`)).toBe(`text-${name}`)
    expect(cn(`text-${name}`, 'text-muted')).toBe(`text-${name} text-muted`)
  })

  it('lets a later colour replace an earlier one', () => {
    expect(cn('text-muted', 'text-ink')).toBe('text-ink')
  })
})
