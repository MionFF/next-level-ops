import { getAuthProfile } from './get-auth-profile'

type ProfileData = {
  role: string | null
  member_id?: unknown
}

type SupabaseClientMock = {
  auth: {
    getUser: jest.Mock
  }
  schema: jest.Mock
}

let mockSupabaseClient: SupabaseClientMock

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockSupabaseClient),
}))

function createSupabaseMock({
  userId = 'user-1',
  profileData = { role: 'client', member_id: 'member-1' },
}: {
  userId?: string | null
  profileData?: ProfileData | null
} = {}) {
  const getUser = jest.fn(async () => ({
    data: { user: userId ? { id: userId } : null },
  }))
  const maybeSingle = jest.fn(async () => ({ data: profileData }))
  const eq = jest.fn(() => ({ maybeSingle }))
  const select = jest.fn(() => ({ eq }))
  const from = jest.fn(() => ({ select }))
  const schema = jest.fn(() => ({ from }))

  mockSupabaseClient = {
    auth: { getUser },
    schema,
  }

  return { getUser, schema, from, select, eq }
}

describe('getAuthProfile', () => {
  it('returns no auth profile and skips the profile query when there is no user', async () => {
    const { getUser, schema } = createSupabaseMock({ userId: null })

    await expect(getAuthProfile()).resolves.toEqual({
      user: null,
      profile: null,
    })

    expect(getUser).toHaveBeenCalledTimes(1)
    expect(schema).not.toHaveBeenCalled()
  })

  it('selects the minimal profile fields for the current user', async () => {
    const { schema, from, select, eq } = createSupabaseMock({
      userId: 'current-user',
      profileData: {
        role: 'client',
        member_id: 'member-7',
      },
    })

    await expect(getAuthProfile()).resolves.toEqual({
      user: { id: 'current-user' },
      profile: {
        role: 'client',
        member_id: 'member-7',
      },
    })

    expect(schema).toHaveBeenCalledWith('public')
    expect(from).toHaveBeenCalledWith('profiles')
    expect(select).toHaveBeenCalledWith('role, member_id')
    expect(eq).toHaveBeenCalledWith('id', 'current-user')
  })

  it.each([
    ['unknown role and null member ID', { role: 'owner', member_id: null }],
    ['missing member ID', { role: 'admin' }],
  ])('normalizes %s', async (_description, profileData) => {
    createSupabaseMock({ profileData })

    await expect(getAuthProfile()).resolves.toEqual({
      user: { id: 'user-1' },
      profile: {
        role: profileData.role === 'admin' ? 'admin' : null,
        member_id: null,
      },
    })
  })

  it('returns a null profile when the current user has no profile row', async () => {
    createSupabaseMock({ profileData: null })

    await expect(getAuthProfile()).resolves.toEqual({
      user: { id: 'user-1' },
      profile: null,
    })
  })
})
