import { FlaskConical } from 'lucide-react'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/base/drawer'
import { strings } from '@/shared/utils/strings'
import { clockShifts } from '../utils/clock-shifts'
import { formatClock } from '../utils/format-clock'

/**
 * The sandbox marker, always on screen while the sandbox is active, opening the debug panel.
 * Renders nothing on the real journal.
 * The panel only moves time and wipes facts: nothing here grants a derived value (ADR-0002).
 */
export function DebugPanel() {
  const { now, sandbox } = useJournalSource()
  if (sandbox === null) return null
  const copy = strings.debug

  return (
    // Not modal: the streak behind stays live and readable while the clock moves.
    <Drawer showSwipeHandle modal={false}>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-md px-safe pb-safe-4">
          <DrawerTrigger className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 font-semibold text-label text-page">
            <FlaskConical aria-hidden="true" className="size-4" />
            {copy.marker}
          </DrawerTrigger>
        </div>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{copy.title}</DrawerTitle>
          <DrawerDescription>{copy.lead}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-5 pt-5">
          <div className="flex flex-col gap-1">
            <span className="text-ink-soft text-label">{copy.clock}</span>
            <output className="font-semibold text-body tabular-nums">{formatClock(now)}</output>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-ink-soft text-label">{copy.shifts}</legend>
            <div className="grid grid-cols-4 gap-2">
              {clockShifts.map((shift) => (
                <Button
                  key={shift.copyKey}
                  variant="secondary"
                  className="tabular-nums"
                  onClick={() => sandbox.shiftClock(shift.byMs)}
                >
                  {copy[shift.copyKey]}
                </Button>
              ))}
            </div>
          </fieldset>
          <Button variant="outline" onClick={sandbox.resetClock}>
            {copy.realTime}
          </Button>
        </div>
        <DrawerFooter>
          <Button variant="destructive" size="lg" onClick={() => void sandbox.wipe()}>
            {copy.wipe}
          </Button>
          <DrawerClose render={<Button variant="ghost" size="lg" />}>{copy.close}</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
