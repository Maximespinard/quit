import { createLink } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { buttonVariants } from '@/shared/ui/base/button'
import { cn } from '@/shared/utils/cn'

/** The way back, a 44px chevron pulled into the gutter so the glyph, not its target, aligns. */
function BackAnchor({ className, ...rest }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), '-ml-3', className)}
      {...rest}
    >
      <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
    </a>
  )
}

/** A router link drawn as the back chevron: same type-safe props as `Link`, plus its label. */
export const BackLink = createLink(BackAnchor)

type PageHeaderProps = {
  title: string
  /** One line under the title saying what the screen is for. */
  lead?: string
  /** The `BackLink` to the screen above. */
  back: ReactNode
}

/** Every screen below home opens the same way: the chevron back, the title beside it. */
export function PageHeader({ title, lead, back }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {back}
        <h2 className="text-title">{title}</h2>
      </div>
      {lead === undefined ? null : <p className="text-body text-muted">{lead}</p>}
    </div>
  )
}
