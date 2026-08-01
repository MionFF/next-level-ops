import {
  getBookingDateBoundaries,
  getBookingsMemberSearchFilter,
  getBookingsSessionSearchFilter,
  isValidBookingDate,
  isValidBookingDateRange,
} from './bookings-query'

describe('booking search filters', () => {
  it('creates a case-insensitive partial member name or email filter', () => {
    expect(getBookingsMemberSearchFilter('Alex Morgan')).toBe(
      'member_name.ilike."*Alex Morgan*",member_email.ilike."*Alex Morgan*"',
    )
  })

  it('creates a case-insensitive partial session-title filter', () => {
    expect(getBookingsSessionSearchFilter('Morning strength')).toBe(
      'session_title.ilike."*Morning strength*"',
    )
  })

  it('escapes quotes and backslashes in member search', () => {
    expect(getBookingsMemberSearchFilter('Alex \\"Morgan"')).toBe(
      'member_name.ilike."*Alex \\\\\\"Morgan\\"*",member_email.ilike."*Alex \\\\\\"Morgan\\"*"',
    )
  })

  it('escapes quotes and backslashes in session search', () => {
    expect(getBookingsSessionSearchFilter('Coach \\"Sam"')).toBe(
      'session_title.ilike."*Coach \\\\\\"Sam\\"*"',
    )
  })
})

describe('booking date helpers', () => {
  it.each(['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31'])(
    'accepts the valid calendar date %s',
    value => {
      expect(isValidBookingDate(value)).toBe(true)
    },
  )

  it.each([
    '',
    '2026-1-01',
    '2026-01-1',
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '0000-01-01',
    'not-a-date',
    undefined,
  ])('rejects the invalid calendar date %s', value => {
    expect(isValidBookingDate(value)).toBe(false)
  })

  it('creates an inclusive From boundary', () => {
    expect(getBookingDateBoundaries('2026-07-10', '')).toEqual({
      fromInclusive: '2026-07-10T00:00:00.000Z',
      toExclusive: null,
    })
  })

  it('includes the complete To date through an exclusive next-day boundary', () => {
    expect(getBookingDateBoundaries('', '2026-07-10')).toEqual({
      fromInclusive: null,
      toExclusive: '2026-07-11T00:00:00.000Z',
    })
  })

  it('represents equal From and To values as one complete calendar day', () => {
    expect(getBookingDateBoundaries('2026-07-10', '2026-07-10')).toEqual({
      fromInclusive: '2026-07-10T00:00:00.000Z',
      toExclusive: '2026-07-11T00:00:00.000Z',
    })
  })

  it('handles month and year rollovers deterministically', () => {
    expect(getBookingDateBoundaries('', '2026-04-30').toExclusive).toBe(
      '2026-05-01T00:00:00.000Z',
    )
    expect(getBookingDateBoundaries('', '2026-12-31').toExclusive).toBe(
      '2027-01-01T00:00:00.000Z',
    )
    expect(getBookingDateBoundaries('', '2028-02-29').toExclusive).toBe(
      '2028-03-01T00:00:00.000Z',
    )
  })
})

describe('isValidBookingDateRange', () => {
  it.each([
    ['', ''],
    ['2026-07-01', ''],
    ['', '2026-07-08'],
    ['2026-07-01', '2026-07-08'],
    ['2026-07-08', '2026-07-08'],
  ])('accepts the date range %s — %s', (from, to) => {
    expect(isValidBookingDateRange(from, to)).toBe(true)
  })

  it('rejects a From date after the To date', () => {
    expect(isValidBookingDateRange('2026-07-08', '2026-07-01')).toBe(false)
  })
})
