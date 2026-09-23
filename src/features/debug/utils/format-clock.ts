const clockFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** The sandbox clock as the panel shows it, in the device's time zone. */
export const formatClock = (ms: number) => clockFormat.format(ms)
