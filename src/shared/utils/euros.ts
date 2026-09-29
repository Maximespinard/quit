/** A signed amount with at most two decimals, French comma or dot: `35`, `35,5`, `-12.05`. */
const AMOUNT = /^(-?)(\d+)(?:[.,](\d{1,2}))?$/

/**
 * Reads euros typed in a text field as integer cents, with no float on the way. Spaces and a
 * euro sign are ignored; anything else unreadable gives `null`. The domain refuses the sign.
 */
export function fromEuroText(text: string): number | null {
  const match = AMOUNT.exec(text.replace(/[\s€]/g, ''))
  if (match === null) return null
  const [, sign = '', euros = '0', decimals = ''] = match
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, '0'))
  return sign === '-' ? -cents : cents
}

/** Cents as a French text field holds them: `35,50`, or `42` for whole euros. */
export const toEuroText = (cents: number) =>
  cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace('.', ',')

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const wholeEuros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
})

/** Cents as French copy shows them: `1 250,08 €`, or `400 €` for whole euros. */
export const formatEuros = (cents: number) =>
  (cents % 100 === 0 ? wholeEuros : euros).format(cents / 100)
