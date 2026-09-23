import { twoDigits } from '@/shared/utils/format'

/** Formats a timestamp as the local `YYYY-MM-DDTHH:mm` value a `datetime-local` input takes. */
export function toDatetimeLocal(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${twoDigits(d.getMonth() + 1)}-${twoDigits(d.getDate())}T${twoDigits(d.getHours())}:${twoDigits(d.getMinutes())}`
}

/** Parses a `datetime-local` value as local time; `null` when the browser gave nothing usable. */
export function fromDatetimeLocal(value: string): number | null {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}
