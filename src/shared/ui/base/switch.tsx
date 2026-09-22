import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/shared/utils/cn'

/** shadcn `switch`, reskinned: 51×31 iOS-sized track, action colour when checked. */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer group/switch relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-0.5 transition-colors duration-150 ease-out-expo after:absolute after:-inset-2 data-checked:bg-action data-unchecked:bg-line data-disabled:cursor-not-allowed data-disabled:opacity-50 motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-[27px] rounded-full bg-white transition-transform duration-150 ease-out-expo data-checked:translate-x-5 data-unchecked:translate-x-0 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
