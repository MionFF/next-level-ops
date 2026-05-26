function toDatetimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export function createFutureSessionDateTimes() {
  const starts = new Date()

  starts.setDate(starts.getDate() + 14)
  starts.setHours(10, 0, 0, 0)

  const ends = new Date(starts)
  ends.setHours(11, 0, 0, 0)

  return {
    startsAt: toDatetimeLocalValue(starts),
    endsAt: toDatetimeLocalValue(ends),
  }
}
