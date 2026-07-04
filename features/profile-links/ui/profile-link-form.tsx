'use client'

import { useActionState } from 'react'
import { linkProfileMember, type LinkProfileMemberFormState } from '../actions/link-profile-member'
import type { ClientProfile, MemberOption } from '../model/profile-link'

const initialState: LinkProfileMemberFormState = {
  message: '',
  errors: {},
}

type LinkProfileMemberAction = (
  prevValue: LinkProfileMemberFormState,
  formData: FormData,
) => Promise<LinkProfileMemberFormState>

type ProfileLinkFormProps = {
  profiles: ClientProfile[]
  members: MemberOption[]
  action?: LinkProfileMemberAction
}

function getProfileLabel(profile: ClientProfile) {
  return profile.full_name?.trim() || 'Unnamed client profile'
}

export default function ProfileLinkForm({
  profiles,
  members,
  action = linkProfileMember,
}: ProfileLinkFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  const isDisabled = profiles.length === 0 || members.length === 0 || isPending
  const profileError = state.errors?.profileId?.[0]
  const memberError = state.errors?.memberId?.[0]

  return (
    <form
      action={formAction}
      noValidate
      className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4'
    >
      <div className='mb-4'>
        <h3 className='text-sm font-semibold text-[var(--foreground)]'>Create link</h3>
        <p className='mt-1 text-sm leading-6 text-[var(--muted)]'>
          Select one client profile and one available studio member.
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start'>
        <div className='min-w-0'>
          <label
            htmlFor='profile-link-profile'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Client profile
          </label>
          <select
            id='profile-link-profile'
            name='profileId'
            disabled={isDisabled}
            defaultValue=''
            aria-invalid={Boolean(profileError)}
            aria-describedby={profileError ? 'profile-link-profile-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:text-[var(--muted)]'
          >
            <option value='' disabled>
              Select profile
            </option>
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {getProfileLabel(profile)}
              </option>
            ))}
          </select>
          {profileError && (
            <p id='profile-link-profile-error' className='mt-2 text-sm text-[var(--danger)]'>
              {profileError}
            </p>
          )}
        </div>

        <div className='min-w-0'>
          <label
            htmlFor='profile-link-member'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Available member
          </label>
          <select
            id='profile-link-member'
            name='memberId'
            disabled={isDisabled}
            defaultValue=''
            aria-invalid={Boolean(memberError)}
            aria-describedby={memberError ? 'profile-link-member-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:text-[var(--muted)]'
          >
            <option value='' disabled>
              Select member
            </option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.full_name} — {member.email}
              </option>
            ))}
          </select>
          {memberError && (
            <p id='profile-link-member-error' className='mt-2 text-sm text-[var(--danger)]'>
              {memberError}
            </p>
          )}
        </div>

        <div className='lg:pt-7'>
          <button
            type='submit'
            disabled={isDisabled}
            className='w-full rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] lg:w-auto cursor-pointer'
          >
            {isPending ? 'Linking...' : 'Link profile'}
          </button>
        </div>
      </div>

      {state.message && (
        <p
          role='status'
          className='mt-4 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]'
        >
          {state.message}
        </p>
      )}

      {(profiles.length === 0 || members.length === 0) && (
        <p className='mt-4 text-sm text-[var(--muted)]'>
          Linking requires at least one unlinked client profile and one available member.
        </p>
      )}
    </form>
  )
}
