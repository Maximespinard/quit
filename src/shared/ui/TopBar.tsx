import type { ReactNode } from 'react'
import { strings } from '@/shared/utils/strings'

type TopBarProps = {
  /** The brand mark; defaults to the app name. The app layer may wire it to a gesture. */
  brand?: ReactNode
  /** Where the user is, across from the brand, e.g. the current protocol step. */
  children?: ReactNode
  /** A 44px icon control after the context (settings). */
  action?: ReactNode
}

/**
 * Every screen's top bar, as in the visual target: the brand left, the context right. The
 * parent owns the side insets; an action's icon hangs into the inset so its glyph lines up.
 */
export function TopBar({ brand = strings.app.name, children, action }: TopBarProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 pt-2">
      <h1 className="text-brand">{brand}</h1>
      {children === undefined && action === undefined ? null : (
        <span className="flex items-center gap-2 text-body">
          {children}
          {action === undefined ? null : <span className="-mr-2.5">{action}</span>}
        </span>
      )}
    </div>
  )
}
