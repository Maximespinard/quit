import themeCss from '@/index.css?raw'

/**
 * The names the `@theme` block declares under one namespace, e.g. `themeTokens('radius')` →
 * `['hero', 'card', …]`. Sub-properties (`--text-body--line-height`) and resets are skipped.
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
