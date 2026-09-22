import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export type TabItem<Id extends string> = {
  id: Id
  label: string
  icon: ReactNode
}

type TabBarProps<Id extends string> = {
  label: string
  items: readonly TabItem<Id>[]
  activeId: Id
  onSelect: (id: Id) => void
}

/** Bottom navigation: icon over label, the active item in the action colour. */
export function TabBar<Id extends string>({ label, items, activeId, onSelect }: TabBarProps<Id>) {
  return (
    <nav aria-label={label} className="bg-page pb-safe">
      {/* The bar tracks the content column: a full-bleed rule would float free of it on desktop. */}
      <ul className="mx-auto flex max-w-md border-line border-t px-2 pt-2 pb-1">
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
                className={cn(
                  'flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-control text-tab',
                  active ? 'text-action' : 'text-ink-soft active:text-ink',
                )}
              >
                <span className="size-6 [&_svg]:size-6">{item.icon}</span>
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
