import { getSessionsHref } from './sessions-url'

describe('getSessionsHref', () => {
  it('returns the base URL for default state', () => {
    expect(
      getSessionsHref({
        search: '',
        trainer: '',
        statuses: [],
        from: '',
        to: '',
        sort: 'soonest',
        page: 1,
      }),
    ).toBe('/dashboard/sessions')
  })

  it('serializes all supported filters in deterministic order', () => {
    expect(
      getSessionsHref({
        search: '  Morning strength  ',
        trainer: 'trainer-1',
        statuses: ['completed', 'scheduled'],
        from: '2026-07-01',
        to: '2026-07-31',
        sort: 'latest',
        page: 3,
      }),
    ).toBe(
      '/dashboard/sessions?search=Morning+strength&trainer=trainer-1&statuses=scheduled&statuses=completed&from=2026-07-01&to=2026-07-31&sort=latest&page=3',
    )
  })

  it('deduplicates and orders statuses by canonical domain order', () => {
    expect(
      getSessionsHref({
        search: '',
        trainer: '',
        statuses: ['cancelled', 'full', 'scheduled', 'full'],
        from: '',
        to: '',
        sort: 'soonest',
        page: 1,
      }),
    ).toBe('/dashboard/sessions?statuses=scheduled&statuses=full&statuses=cancelled')
  })

  it('includes a non-default page', () => {
    expect(
      getSessionsHref({
        search: '',
        trainer: '',
        statuses: [],
        from: '',
        to: '',
        sort: 'soonest',
        page: 4,
      }),
    ).toBe('/dashboard/sessions?page=4')
  })

  it('encodes query values through URLSearchParams', () => {
    expect(
      getSessionsHref({
        search: 'Strength & "Mobility"',
        trainer: 'trainer/id?1',
        statuses: [],
        from: '',
        to: '',
        sort: 'soonest',
        page: 1,
      }),
    ).toBe('/dashboard/sessions?search=Strength+%26+%22Mobility%22&trainer=trainer%2Fid%3F1')
  })
})
