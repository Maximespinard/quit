import { fromDecimalText } from '@/shared/utils/decimal-text'
import { fromEuroText, toEuroText } from '@/shared/utils/euros'
import { strings } from '@/shared/utils/strings'
import { isValidBaseline, isValidWeeklySpend } from '../domain/journal-settings'

/** How one numeric setting is typed, read back and refused, shared by first launch and settings. */
export type ValueInput = {
  readonly inputMode: 'decimal' | 'numeric'
  readonly suffix?: string
  /** Unreadable text reads as `NaN`: the domain refuses it like any invalid value. */
  readonly read: (text: string) => number
  readonly isValid: (value: number) => boolean
  readonly toText: (value: number) => string
  readonly invalid: string
}

/** Typed in euros, kept in integer cents. */
export const spendInput: ValueInput = {
  inputMode: 'decimal',
  suffix: strings.settings.spend.suffix,
  read: (text) => fromEuroText(text) ?? Number.NaN,
  isValid: isValidWeeklySpend,
  toText: toEuroText,
  invalid: strings.money['invalid-spend'],
}

export const baselineInput: ValueInput = {
  inputMode: 'numeric',
  read: fromDecimalText,
  isValid: isValidBaseline,
  toText: String,
  invalid: strings.baseline['invalid-baseline'],
}
