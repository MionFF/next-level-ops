'use client'

import { useActionState, useState } from 'react'
import { linkProfileMember, type LinkProfileMemberFormState } from '../actions/link-profile-member'
import type { ClientProfile, MemberOption } from '../model/profile-link'
import { SingleSelect } from '@/shared/ui/single-select'

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
  const [profileId, setProfileId] = useState('')
  const [memberId, setMemberId] = useState('')

  const isDisabled = profiles.length === 0 || members.length === 0 || isPending
  const profileError = state.errors?.profileId?.[0]
  const memberError = state.errors?.memberId?.[0]
  const profileOptions = profiles.map(profile => ({
    value: profile.id,
    label: getProfileLabel(profile),
  }))
  const memberOptions = members.map(member => ({
    value: member.id,
    label: `${member.full_name} — ${member.email}`,
  }))

  const selectedProfileId = profiles.some(profile => profile.id === profileId) ? profileId : ''
  const selectedMemberId = members.some(member => member.id === memberId) ? memberId : ''

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
          <SingleSelect
            label='Client profile'
            name='profileId'
            options={profileOptions}
            value={selectedProfileId}
            onChange={setProfileId}
            disabled={isDisabled}
            placeholder='Select profile'
            aria-invalid={Boolean(profileError)}
            aria-describedby={profileError ? 'profile-link-profile-error' : undefined}
          />
          {profileError && (
            <p id='profile-link-profile-error' className='mt-2 text-sm text-[var(--danger)]'>
              {profileError}
            </p>
          )}
        </div>

        <div className='min-w-0'>
          <SingleSelect
            label='Available member'
            name='memberId'
            options={memberOptions}
            value={selectedMemberId}
            onChange={setMemberId}
            disabled={isDisabled}
            placeholder='Select member'
            aria-invalid={Boolean(memberError)}
            aria-describedby={memberError ? 'profile-link-member-error' : undefined}
          />
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
