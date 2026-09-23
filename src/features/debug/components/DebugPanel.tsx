import { useNavigate } from '@tanstack/react-router'
import { FlaskConical, X } from 'lucide-react'
import { useJournalSource } from '@/shared/hooks/useJournalSource'
import { Button } from '@/shared/ui/base/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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
  const navigate = useNavigate()
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
      {/* Kept short so the hero's clock stays in view above it. */}
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader className="flex-row items-start justify-between gap-3 pr-2">
          <div className="flex flex-col gap-1 pt-2">
            <DrawerTitle>{copy.title}</DrawerTitle>
            <DrawerDescription>{copy.lead}</DrawerDescription>
          </div>
          <DrawerClose render={<Button variant="ghost" size="icon" aria-label={copy.close} />}>
            <X aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-5 pt-4 pb-safe-4">
          {/* Not an <output>: a live region would read the running clock out every second. */}
          <time
            dateTime={new Date(now).toISOString()}
            className="font-semibold text-body tabular-nums"
          >
            {formatClock(now)}
          </time>
          <fieldset>
            <legend className="sr-only">{copy.shifts}</legend>
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
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="destructive" onClick={() => void sandbox.wipe()}>
              {copy.wipe}
            </Button>
            <Button variant="outline" onClick={() => void navigate({ to: '/', search: {} })}>
              {copy.leave}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
