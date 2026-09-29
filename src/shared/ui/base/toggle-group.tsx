import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { toggleVariants } from '@/shared/ui/base/toggle'
import { cn } from '@/shared/utils/cn'

type ToggleGroupSettings = VariantProps<typeof toggleVariants> & {
  /** Gap between items in spacing units; 0 fuses them into one segmented control. */
  spacing?: number
  orientation?: 'horizontal' | 'vertical'
}

const ToggleGroupContext = React.createContext<ToggleGroupSettings>({
  size: 'default',
  variant: 'default',
  spacing: 1.5,
  orientation: 'horizontal',
})

/**
 * shadcn `toggle-group`, reskinned. With `spacing={0}` and `variant="outline"` it is the
 * segmented control: one hairline pill tray, the pressed segment a cream pill inside it.
 */
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 1.5,
  orientation = 'horizontal',
  children,
  ...props
}: ToggleGroupPrimitive.Props & ToggleGroupSettings) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-full data-[spacing=0]:border data-[spacing=0]:border-line data-[spacing=0]:p-1 data-vertical:flex-col data-vertical:items-stretch',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = 'default',
  size = 'default',
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        'shrink-0 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:h-10 group-data-[spacing=0]/toggle-group:flex-1 group-data-[spacing=0]/toggle-group:border-0',
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
