import themeCss from '@/index.css?raw'

/**
 * The tokens the `@theme` block declares under one namespace, name → value, e.g.
 * `themeTokens('radius')` → `hero → 1.75rem`, `card → 0.75rem`, … Sub-properties
 * (`--text-body--line-height`) and resets are skipped. Test-only: it reads the app's own
 * stylesheet, the one import from outside `shared/` this layer allows itself.
 */
export function themeTokens(namespace: string): Map<string, string> {
  const theme = themeCss.slice(themeCss.indexOf('@theme'))
  const declaration = new RegExp(`--${namespace}-([a-z][a-z-]*?):\\s*([^;]+);`, 'g')
  const tokens = new Map<string, string>()
  for (const [, name, value] of theme.matchAll(declaration)) {
    if (name !== undefined && value !== undefined && !name.includes('--')) tokens.set(name, value)
  }
  return tokens
}
