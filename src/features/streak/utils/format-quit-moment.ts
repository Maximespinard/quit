const formatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/** "22 sept., 10:00" — the quit moment as the hero's context line. */
export const formatQuitMoment = (ms: number) => formatter.format(ms)
