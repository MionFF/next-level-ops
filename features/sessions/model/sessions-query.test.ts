import {
  getSessionDateBoundaries,
  getSessionsSearchFilter,
  isValidSessionDate,
  isValidSessionDateRange,
} from './sessions-query'

describe('getSessionsSearchFilter', () => {
  it('creates a case-insensitive partial title filter', () => {
    expect(getSessionsSearchFilter('Morning strength')).toBe('title.ilike."*Morning strength*"')
  })

  it('escapes quotes and backslashes for PostgREST', () => {
    expect(getSessionsSearchFilter('Coach \\"Sam"')).toBe('title.ilike."*Coach \\\\\\"Sam\\"*"')
  })
})

describe('session date helpers', () => {
  it.each(['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31'])(
    'accepts the valid calendar date %s',
    value => {
      expect(isValidSessionDate(value)).toBe(true)
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
    expect(isValidSessionDate(value)).toBe(false)
  })

  it('creates an inclusive From boundary', () => {
    expect(getSessionDateBoundaries('2026-07-10', '')).toEqual({
      fromInclusive: '2026-07-10T00:00:00.000Z',
      toExclusive: null,
    })
  })

  it('includes the entire To date through an exclusive next-day boundary', () => {
    expect(getSessionDateBoundaries('', '2026-07-10')).toEqual({
      fromInclusive: null,
      toExclusive: '2026-07-11T00:00:00.000Z',
    })
  })

  it('represents equal From and To values as one full calendar day', () => {
    expect(getSessionDateBoundaries('2026-07-10', '2026-07-10')).toEqual({
      fromInclusive: '2026-07-10T00:00:00.000Z',
      toExclusive: '2026-07-11T00:00:00.000Z',
    })
  })

  it('handles month and year rollovers deterministically', () => {
    expect(getSessionDateBoundaries('', '2026-12-31').toExclusive).toBe('2027-01-01T00:00:00.000Z')
    expect(getSessionDateBoundaries('', '2028-02-29').toExclusive).toBe('2028-03-01T00:00:00.000Z')
  })
})

describe('isValidSessionDateRange', () => {
  it.each([
    ['', ''],
    ['2026-07-01', ''],
    ['', '2026-07-08'],
    ['2026-07-01', '2026-07-08'],
    ['2026-07-08', '2026-07-08'],
  ])('accepts the date range %s — %s', (from, to) => {
    expect(isValidSessionDateRange(from, to)).toBe(true)
  })

  it('rejects a From date after the To date', () => {
    expect(isValidSessionDateRange('2026-07-08', '2026-07-01')).toBe(false)
  })
})
