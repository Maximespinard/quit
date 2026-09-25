/** Local midnight opening the calendar day `offset` days after the one holding `at`. */
export const localMidnight = (at: number, offset = 0): number => {
  const date = new Date(at)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset).getTime()
}
