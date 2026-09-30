import type { FactId } from '@quit/contract/facts'
import type { ReactNode } from 'react'
import { derive } from '@/shared/domain/derive'
import { type Journal, removeFact } from '@/shared/domain/journal'
import { ThumbZone } from '@/shared/ui/ThumbZone'
import { strings } from '@/shared/utils/strings'
import type { EditContext, FactForms } from '../types/edit-fact'
import { type HistoryFact, historyFact } from '../utils/history-days'
import { DeleteFact } from './DeleteFact'

type EditFactProps = {
  journal: Journal
  factId: FactId
  now: number
  /** The form of each fact type: they belong to other features, wired by the route. */
  forms: FactForms
  onEdited: (journal: Journal) => void
  onDeleted: (journal: Journal) => void
  /** The way back to the history, without changing anything. */
  back: ReactNode
}

const copy = strings.history

/** The form that recorded `fact`, or only its secondary actions when none can open. */
function formFor(fact: HistoryFact, forms: FactForms, journal: Journal, context: EditContext) {
  switch (fact.type) {
    case 'lapse':
      return forms.lapse(fact, context)
    case 'craving':
      return forms.craving(fact, context)
    case 'patch-application': {
      const { protocol } = derive(journal, context.now)
      return protocol === null ? (
        <ThumbZone>{context.secondary}</ThumbZone>
      ) : (
        forms['patch-application'](fact, { ...context, position: protocol })
      )
    }
    default: {
      const unhandled: never = fact
      return unhandled
    }
  }
}

/**
 * One fact of the history, opened by its id, to edit or delete. Its form is the one that
 * recorded it, given the journal without it: saving records the new version, under the same
 * id, by the same rules as at creation.
 */
export function EditFact({
  journal,
  factId,
  now,
  forms,
  onEdited,
  onDeleted,
  back,
}: EditFactProps) {
  const fact = historyFact(journal, factId)
  if (fact === null) {
    return (
      <>
        <p className="pt-6 text-body text-muted">{copy.missing}</p>
        <ThumbZone>{back}</ThumbZone>
      </>
    )
  }
  const rest = removeFact(journal, factId)
  return formFor(fact, forms, journal, {
    rest,
    now,
    onSaved: onEdited,
    secondary: (
      <>
        {/* Set apart under a rule: saving and deleting never sit one mis-tap apart. */}
        <div className="mt-4 flex flex-col border-line border-t pt-6">
          <DeleteFact fact={fact} onDelete={() => onDeleted(rest)} />
        </div>
        {back}
      </>
    ),
  })
}
