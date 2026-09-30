import type { ReactNode } from 'react'
import type { Journal } from '@/shared/domain/journal'
import type { ProtocolPosition } from '@/shared/domain/protocol-position'
import type { HistoryFact } from '../utils/history-days'

/**
 * What the form of a fact needs: the journal without it, the clock, where the edit goes, and
 * what sits under its primary action.
 */
export type EditContext = {
  readonly rest: Journal
  readonly now: number
  readonly onSaved: (journal: Journal) => void
  readonly secondary: ReactNode
}

/** The history fact of one type. */
type FactOfType<T extends HistoryFact['type']> = Extract<HistoryFact, { type: T }>

/**
 * The form that recorded each fact type, prefilled with the fact. One entry per type: a fact
 * type added to the journal fails to compile here until it can be edited. A patch application
 * is edited against the protocol position in force.
 */
export type FactForms = {
  readonly [T in Exclude<HistoryFact['type'], 'patch-application'>]: (
    fact: FactOfType<T>,
    context: EditContext,
  ) => ReactNode
} & {
  readonly 'patch-application': (
    fact: FactOfType<'patch-application'>,
    context: EditContext & { readonly position: ProtocolPosition },
  ) => ReactNode
}
