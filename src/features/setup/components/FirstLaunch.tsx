import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { startJourney } from '@/shared/domain/first-launch'
import type { Journal } from '@/shared/domain/journal'
import { Button } from '@/shared/ui/base/button'
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
}

type Answers = {
  quitMoment: number | null
  weeklySpendCents: number | null
  baselineSmokesPerDay: number | null
}

const STEP_COUNT = 4
const copy = strings.firstLaunch

/**
 * The quit moment, the weekly spend, the baseline, then the default protocol: one question a
 * screen, and nothing is written until the last one is accepted.
 */
export function FirstLaunch({ journal, now, onStarted }: FirstLaunchProps) {
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
    )
    // Every answer was checked on its own step; a refusal here sends the user back to fix it.
    if (result.ok) onStarted(result.journal)
    else setStep(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-11 items-center gap-2">
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
        ) : null}
        <p className="text-ink-soft text-label">{copy.progress(step, STEP_COUNT)}</p>
      </div>

      {step === 1 ? (
        <QuitMomentStep
          journal={journal}
          now={now}
          onPicked={(quitMoment) => answer({ quitMoment })}
        />
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
