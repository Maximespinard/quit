import { createLink } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/shared/utils/cn'

/** One row of a link list card: the label, a chevron at the far end, a hairline above the next. */
function RowAnchor({ className, children, ...rest }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      className={cn(
        'flex min-h-13 items-center justify-between gap-3 border-line border-t text-cta font-normal text-ink first:border-t-0 active:text-muted',
        className,
      )}
      {...rest}
    >
      {children}
      <ChevronRight aria-hidden="true" className="size-4.5 text-muted" strokeWidth={2} />
    </a>
  )
}

/** A router link drawn as a list row: same type-safe props as `Link`. */
export const RowLink = createLink(RowAnchor)
