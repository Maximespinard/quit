import type { Protocol } from '@/shared/domain/protocol'
import { Button } from '@/shared/ui/base/button'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'
import { SetupQuestion } from './SetupQuestion'

const copy = strings.firstLaunch.protocol

type ProtocolStepProps = {
  protocol: Protocol
  onStart: () => void
}

/** First launch, last step: the default protocol shown as it is, accepted in one tap. */
export function ProtocolStep({ protocol, onStart }: ProtocolStepProps) {
  return (
    <SetupQuestion
      title={copy.title}
      lead={copy.lead}
      action={
        <Button size="lg" onClick={onStart}>
          {copy.start}
        </Button>
      }
    >
      <ol className="flex flex-col divide-y divide-line rounded-card bg-surface px-4">
        {protocol.map((step, index) => (
          // The default protocol never changes while shown: its order is its identity.
          // biome-ignore lint/suspicious/noArrayIndexKey: steps have no id of their own
          <li key={index} className="flex items-baseline justify-between gap-3 py-3.5">
            <span className="text-label text-muted">{strings.protocol.step(index + 1)}</span>
            <span className="font-medium text-body tabular-nums">
              {copy.step(formatDose(step.doseMg), step.durationDays)}
            </span>
          </li>
        ))}
      </ol>
    </SetupQuestion>
  )
}
