import type { Streak } from '@/shared/domain/derive'
import { splitDuration } from '@/shared/utils/duration'
import { strings } from '@/shared/utils/strings'

type SlipNoteProps = {
  /** Since the latest lapse, while it is a slip; `null` hides the note. */
  lastCigarette: Streak | null
  /** Lapse days in a row still open: one or two are said, the threshold with them. */
  lapseDaysInARow: number
}

const copy = strings.lapse

/** After a slip: how long since the last cigarette, and how close a relapse is. Neutral, no verdict. */
export function SlipNote({ lastCigarette, lapseDaysInARow }: SlipNoteProps) {
  if (lastCigarette === null) return null
  const { days, hours, minutes } = splitDuration(lastCigarette.elapsedMs)
  const nearRelapse = lapseDaysInARow === 1 || lapseDaysInARow === 2

  return (
    <div className="flex flex-col gap-1 text-body text-ink-soft">
      <p>{copy.lastCigarette(copy.ago(days, hours, minutes))}</p>
      {nearRelapse ? <p>{copy.lapseDays(lapseDaysInARow)}</p> : null}
    </div>
  )
}
