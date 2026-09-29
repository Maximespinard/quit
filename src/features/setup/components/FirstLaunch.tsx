import { ChevronLeft } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { startJourney } from '@/shared/domain/first-launch'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
import { cn } from '@/shared/utils/cn'
import { newFactId } from '@/shared/utils/fact-id'
import { strings } from '@/shared/utils/strings'
import { baselineInput, spendInput } from '../utils/value-inputs'
import { ProtocolStep } from './ProtocolStep'
import { QuitMomentStep } from './QuitMomentStep'
import { ValueStep } from './ValueStep'

type FirstLaunchProps = {
  journal: Journal
  /** Injected clock: first launch never reads the system time itself. */
  now: number
  onStarted: (journal: Journal) => void
  /** Offered under the first question only: a journey restored from a file skips them all. */
  restore?: ReactNode
}

type Answers = {
  quitMoment: number | null
  weeklySpendCents: number | null
  baselineSmokesPerDay: number | null
}

const STEPS = [1, 2, 3, 4] as const
const STEP_COUNT = STEPS.length
const copy = strings.firstLaunch

/**
 * The quit moment, the weekly spend, the baseline, then the default protocol: one question a
 * screen, and nothing is written until the last one is accepted.
 */
export function FirstLaunch({ journal, now, onStarted, restore }: FirstLaunchProps) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    quitMoment: null,
    weeklySpendCents: null,
    baselineSmokesPerDay: null,
  })

  const answer = (next: Partial<Answers>) => {
    setAnswers((current) => ({ ...current, ...next }))
    setStep((current) => current + 1)
  }

  const start = () => {
    const { quitMoment, weeklySpendCents, baselineSmokesPerDay } = answers
    if (quitMoment === null || weeklySpendCents === null || baselineSmokesPerDay === null) return
    const result = startJourney(
      journal,
      { quitMoment, weeklySpendCents, baselineSmokesPerDay },
      now,
      newFactId,
    )
    // Every answer was checked on its own step; a refusal here sends the user back to fix it.
    if (result.ok) onStarted(result.journal)
    else setStep(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex min-h-11 items-center gap-3">
        {step > 1 ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={copy.back}
            onClick={() => setStep((current) => current - 1)}
            className="-ml-3"
          >
            <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
          </Button>
        ) : (
          // Holds the chevron's place: the rail must not jump when it appears.
          <span aria-hidden="true" className="-ml-3 size-11 shrink-0" />
        )}
        {/* Crans, like the multiplier: answered in cream, current in muted, ahead as a ghost line. */}
        <div aria-hidden="true" className="flex flex-1 gap-1.5">
          {STEPS.map((number) => (
            <span
              key={number}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-240 ease-out-expo motion-reduce:transition-none',
                number < step ? 'bg-ink' : number === step ? 'bg-muted' : 'bg-ghost-line',
              )}
            />
          ))}
        </div>
        <p className="text-muted text-label tabular-nums">{copy.progress(step, STEP_COUNT)}</p>
      </div>

      {step === 1 ? (
        <>
          <QuitMomentStep
            journal={journal}
            now={now}
            initial={answers.quitMoment}
            onPicked={(quitMoment) => answer({ quitMoment })}
          />
          {/* Another way in, not a third answer: set apart by a filet. */}
          {restore ? <div className="-mt-2 border-line border-t pt-4">{restore}</div> : null}
        </>
      ) : step === 2 ? (
        // Keyed per step: the two value steps must not share a typed draft.
        <ValueStep
          key="spend"
          title={copy.spend.title}
          lead={copy.spend.lead}
          input={spendInput}
          initial={answers.weeklySpendCents}
          onDone={(weeklySpendCents) => answer({ weeklySpendCents })}
        />
      ) : step === 3 ? (
        <ValueStep
          key="baseline"
          title={copy.baseline.title}
          lead={copy.baseline.lead}
          input={baselineInput}
          initial={answers.baselineSmokesPerDay}
          onDone={(baselineSmokesPerDay) => answer({ baselineSmokesPerDay })}
        />
      ) : (
        <ProtocolStep protocol={journal.protocol} onStart={start} />
      )}
    </div>
  )
}
