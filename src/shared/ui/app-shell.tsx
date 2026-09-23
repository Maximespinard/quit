import type { ReactNode } from 'react'
import { strings } from '@/shared/utils/strings'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-safe pt-safe pb-4">
      <h1 className="pt-3 font-semibold text-label">{strings.app.name}</h1>
      {children}
    </div>
  )
}
