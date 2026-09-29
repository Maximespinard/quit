import type { ReactNode } from 'react'
import { strings } from '@/shared/utils/strings'

type CravingTopBarProps = {
  /** Where the user is, on the right. Only the running timer names itself. */
  context?: ReactNode
}

/** The craving flow's top bar, as in the visual target: the brand left, the context right. */
export function CravingTopBar({ context }: CravingTopBarProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 pt-3">
      <h1 className="font-semibold text-title tracking-[-0.03em]">{strings.app.name}</h1>
      {context}
    </div>
  )
}
