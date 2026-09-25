/** Whether two instants fall on the same local calendar day: display wording only. */
export function isSameLocalDay(a: number, b: number): boolean {
  const [x, y] = [new Date(a), new Date(b)]
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}
