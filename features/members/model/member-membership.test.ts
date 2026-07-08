import {
  canCancelMemberMembership,
  getDateInputValue,
  getMemberMembershipStatus,
  getMembershipDefaultStartDate,
  getTodayDateInputValue,
  type MemberMembership,
} from './member-membership'

const now = new Date('2026-07-08T12:00:00.000Z')

function createMembership(overrides: Partial<MemberMembership>): MemberMembership {
  return {
    id: 'membership-1',
    starts_at: '2026-07-01T00:00:00.000Z',
    ends_at: '2026-08-01T00:00:00.000Z',
    stored_status: 'active',
    derived_status: 'active',
    plan: {
      id: 'plan-1',
      name: 'Monthly Unlimited',
      duration_days: 30,
      price_cents: 9900,
    },
    ...overrides,
  }
}

describe('getMemberMembershipStatus', () => {
  it('derives active status for active membership within date range', () => {
    expect(
      getMemberMembershipStatus(
        {
          starts_at: '2026-07-01T00:00:00.000Z',
          ends_at: '2026-08-01T00:00:00.000Z',
          stored_status: 'active',
        },
        now,
      ),
    ).toBe('active')
  })

  it('derives upcoming status for active membership starting in the future', () => {
    expect(
      getMemberMembershipStatus(
        {
          starts_at: '2026-07-09T00:00:00.000Z',
          ends_at: '2026-08-09T00:00:00.000Z',
          stored_status: 'active',
        },
        now,
      ),
    ).toBe('upcoming')
  })

  it('derives expired status for active membership that ended in the past', () => {
    expect(
      getMemberMembershipStatus(
        {
          starts_at: '2026-06-01T00:00:00.000Z',
          ends_at: '2026-07-01T00:00:00.000Z',
          stored_status: 'active',
        },
        now,
      ),
    ).toBe('expired')
  })

  it('derives cancelled status from stored status regardless of dates', () => {
    expect(
      getMemberMembershipStatus(
        {
          starts_at: '2026-07-01T00:00:00.000Z',
          ends_at: '2026-08-01T00:00:00.000Z',
          stored_status: 'cancelled',
        },
        now,
      ),
    ).toBe('cancelled')
  })
})

describe('canCancelMemberMembership', () => {
  it('allows cancelling active and upcoming memberships only', () => {
    expect(canCancelMemberMembership(createMembership({ derived_status: 'active' }))).toBe(true)
    expect(canCancelMemberMembership(createMembership({ derived_status: 'upcoming' }))).toBe(true)
    expect(canCancelMemberMembership(createMembership({ derived_status: 'expired' }))).toBe(false)
    expect(canCancelMemberMembership(createMembership({ derived_status: 'cancelled' }))).toBe(false)
  })
})

describe('getDateInputValue', () => {
  it('formats dates for date inputs', () => {
    expect(getDateInputValue(new Date('2026-07-08T18:30:00.000Z'))).toBe('2026-07-08')
  })
})

describe('getMembershipDefaultStartDate', () => {
  it('uses current membership end date as renewal default start date', () => {
    expect(
      getMembershipDefaultStartDate(
        createMembership({
          ends_at: '2026-08-07T00:00:00.000Z',
        }),
      ),
    ).toBe('2026-08-07')
  })

  it('uses today as fallback start date when there is no current membership', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-07-08T12:00:00.000Z'))

    expect(getMembershipDefaultStartDate(undefined)).toBe('2026-07-08')

    jest.useRealTimers()
  })
})

describe('getTodayDateInputValue', () => {
  it('uses today as date input value', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-07-08T12:00:00.000Z'))

    expect(getTodayDateInputValue()).toBe('2026-07-08')

    jest.useRealTimers()
  })
})
