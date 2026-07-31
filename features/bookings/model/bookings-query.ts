function escapePostgrestFilterValue(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
}

export function getBookingsMemberSearchFilter(search: string) {
  const escapedSearch = escapePostgrestFilterValue(search)

  return `member_name.ilike."*${escapedSearch}*",member_email.ilike."*${escapedSearch}*"`
}

export function getBookingsSessionSearchFilter(search: string) {
  const escapedSearch = escapePostgrestFilterValue(search)

  return `session_title.ilike."*${escapedSearch}*"`
}

const bookingDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function getDaysInMonth(year: number, month: number) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function isValidBookingDate(value: string | undefined): value is string {
  if (!value) {
    return false
  }

  const match = bookingDatePattern.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= getDaysInMonth(year, month)
}

function getNextBookingDate(value: string) {
  const match = bookingDatePattern.exec(value)

  if (!match) {
    return value
  }

  let year = Number(match[1])
  let month = Number(match[2])
  let day = Number(match[3]) + 1

  if (day > getDaysInMonth(year, month)) {
    day = 1
    month += 1
  }

  if (month > 12) {
    month = 1
    year += 1
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getBookingDateBoundaries(from: string, to: string) {
  return {
    fromInclusive: isValidBookingDate(from) ? `${from}T00:00:00.000Z` : null,
    toExclusive: isValidBookingDate(to)
      ? `${getNextBookingDate(to)}T00:00:00.000Z`
      : null,
  }
}

export function isValidBookingDateRange(from: string, to: string) {
  if (!from || !to) {
    return true
  }

  return from <= to
}
