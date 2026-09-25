/** Left-pads a non-negative integer to two digits, as clocks and date inputs show them. */
export const twoDigits = (n: number) => n.toString().padStart(2, '0')

/** A patch dose as French copy shows it: `21`, `3,5`. */
export const formatDose = (doseMg: number) => doseMg.toLocaleString('fr-FR')

/** A local wall-clock time as French copy shows it: `08:05`. */
export function formatTime(ms: number): string {
  const date = new Date(ms)
  return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`
}
