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
import { SandboxActions } from './SandboxActions'
import { ScenarioPicker } from './ScenarioPicker'

/**
 * The sandbox marker, always on screen while the sandbox is active, opening the debug panel.
 * Renders nothing on the real journal.
 * The panel moves time, loads scenarios, injects facts and wipes them: nothing here grants a
 * derived value (ADR-0002) — a state is only reached through a journal and a clock.
 */
export function DebugPanel() {
  const { state, commit, now, sandbox } = useJournalSource()
  const navigate = useNavigate()
  if (sandbox === null) return null
  const copy = strings.debug
  const journal = state.status === 'ready' ? state.journal : null

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
      {/* The clock controls come first so the hero's clock stays in view above them; the rest scrolls. */}
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
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-5 pt-4 pb-safe-4">
          <div className="flex items-baseline justify-between gap-3">
            {/* Not an <output>: a live region would read the running clock out every second. */}
            <time
              dateTime={new Date(now).toISOString()}
              className="font-semibold text-body tabular-nums"
            >
              {formatClock(now)}
            </time>
            {journal === null ? null : (
              <span className="text-ink-soft text-label tabular-nums">
                {copy.facts(journal.facts.length)}
              </span>
            )}
          </div>
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
          {journal === null ? null : (
            <SandboxActions journal={journal} now={now} commit={commit} sandbox={sandbox} />
          )}
          <ScenarioPicker sandbox={sandbox} />
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
