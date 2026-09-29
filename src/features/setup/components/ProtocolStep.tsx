import type { Protocol } from '@quit/contract/settings'
import { useId } from 'react'
import { Button } from '@/shared/ui/base/button'
import { formatDose } from '@/shared/utils/format'
import { strings } from '@/shared/utils/strings'

const copy = strings.firstLaunch.protocol

type ProtocolStepProps = {
  protocol: Protocol
  onStart: () => void
}

/** First launch, last step: the default protocol shown as it is, accepted in one tap. */
export function ProtocolStep({ protocol, onStart }: ProtocolStepProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-title">
          {copy.title}
        </h2>
        <p className="text-body text-muted">{copy.lead}</p>
      </div>
      <ol className="flex flex-col gap-2 rounded-card bg-surface p-4">
        {protocol.map((step, index) => (
          // The default protocol never changes while shown: its order is its identity.
          // biome-ignore lint/suspicious/noArrayIndexKey: steps have no id of their own
          <li key={index} className="flex items-baseline justify-between gap-3">
            <span className="text-muted text-label">{strings.protocol.step(index + 1)}</span>
            <span className="font-medium text-body tabular-nums">
              {copy.step(formatDose(step.doseMg), step.durationDays)}
            </span>
          </li>
        ))}
      </ol>
      <Button size="lg" onClick={onStart}>
        {copy.start}
      </Button>
    </section>
  )
}
