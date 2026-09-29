import type { ReactNode } from 'react'
import { strings } from '@/shared/utils/strings'
import { type HazeLook, HeroHaze } from './HeroHaze'
import { TopBar } from './TopBar'

type AppShellProps = {
  /** The brand mark; defaults to the app name. */
  brand?: ReactNode
  /** `band` behind the top bar and title; `hero`, the full haze, for first launch. */
  haze?: HazeLook
  children: ReactNode
}

export function AppShell({ brand = strings.app.name, haze = 'band', children }: AppShellProps) {
  return (
    <div className="relative isolate">
      <HeroHaze look={haze} />
      {/* Tall as the screen, so a step can hold its primary action down in the thumb zone. */}
      <div className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-safe pt-safe pb-page">
        <TopBar brand={brand} />
        {children}
      </div>
    </div>
  )
}
