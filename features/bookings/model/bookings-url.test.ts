import { getBookingsHref } from './bookings-url'

describe('getBookingsHref', () => {
  it('returns the base URL for default state', () => {
    expect(
      getBookingsHref({
        member: '',
        session: '',
        trainer: '',
        statuses: [],
        from: '',
        to: '',
        sort: 'upcoming',
        page: 1,
      }),
    ).toBe('/dashboard/bookings')
  })

  it('serializes all supported filters in deterministic order', () => {
    expect(
      getBookingsHref({
        member: '  Alex Morgan  ',
        session: '  Morning strength  ',
        trainer: 'trainer-1',
        statuses: ['cancelled', 'in_progress', 'confirmed'],
        from: '2026-07-01',
        to: '2026-07-31',
        sort: 'latest',
        page: 3,
      }),
    ).toBe(
      '/dashboard/bookings?member=Alex+Morgan&session=Morning+strength&trainer=trainer-1&statuses=confirmed&statuses=in_progress&statuses=cancelled&from=2026-07-01&to=2026-07-31&sort=latest&page=3',
    )
  })

  it('serializes explicit soonest sorting because upcoming is the default', () => {
    expect(
      getBookingsHref({
        member: '',
        session: '',
        trainer: '',
        statuses: [],
        from: '',
        to: '',
        sort: 'soonest',
        page: 1,
      }),
    ).toBe('/dashboard/bookings?sort=soonest')
  })

  it('deduplicates and orders statuses by canonical domain order', () => {
    expect(
      getBookingsHref({
        member: '',
        session: '',
        trainer: '',
        statuses: ['cancelled', 'completed', 'confirmed', 'completed'],
        from: '',
        to: '',
        sort: 'upcoming',
        page: 1,
      }),
    ).toBe('/dashboard/bookings?statuses=confirmed&statuses=completed&statuses=cancelled')
  })

  it('includes a non-default page while omitting defaults and empty values', () => {
    expect(
      getBookingsHref({
        member: '   ',
        session: '',
        trainer: '',
        statuses: [],
        from: '',
        to: '',
        sort: 'upcoming',
        page: 4,
      }),
    ).toBe('/dashboard/bookings?page=4')
  })

  it('encodes query values through URLSearchParams', () => {
    expect(
      getBookingsHref({
        member: 'Alex & "Morgan"',
        session: 'Strength / Mobility?',
        trainer: 'trainer/id?1',
        statuses: [],
        from: '',
        to: '',
        sort: 'upcoming',
        page: 1,
      }),
    ).toBe(
      '/dashboard/bookings?member=Alex+%26+%22Morgan%22&session=Strength+%2F+Mobility%3F&trainer=trainer%2Fid%3F1',
    )
  })
})
