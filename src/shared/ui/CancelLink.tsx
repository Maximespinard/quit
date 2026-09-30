import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { buttonVariants } from '@/shared/ui/base/button'
import type { AppSearch } from '@/shared/utils/app-search'

type CancelLinkProps = {
  /** Where leaving the form goes back to. */
  to: '/' | '/history'
  search: AppSearch
  children: ReactNode
}

/** The way out of a form without saving: a ghost button under its primary action. */
export function CancelLink({ to, search, children }: CancelLinkProps) {
  return (
    <Link to={to} search={search} className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
      {children}
    </Link>
  )
}
