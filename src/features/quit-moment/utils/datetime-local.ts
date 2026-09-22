const pad = (n: number) => n.toString().padStart(2, '0')

/** Formats a timestamp as the local `YYYY-MM-DDTHH:mm` value a `datetime-local` input takes. */
export function toDatetimeLocal(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Parses a `datetime-local` value as local time; `null` when the browser gave nothing usable. */
export function fromDatetimeLocal(value: string): number | null {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}
