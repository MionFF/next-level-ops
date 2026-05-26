'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { updateMember, type UpdateMemberFormState } from '../actions/update-member'
import type { EditableMember, MemberStatus } from '../model/member'
import { isMemberStatus, memberStatuses, memberStatusLabels } from '../model/member'

const initialState = { message: '', errors: {} }

type EditMemberFormAction = (
  prevValue: UpdateMemberFormState,
  formData: FormData,
) => Promise<UpdateMemberFormState>

type EditMemberFormProps = {
  member: EditableMember
  action?: EditMemberFormAction
}

export default function EditMemberForm({ member, action }: EditMemberFormProps) {
  const updateMemberAction = action ?? updateMember.bind(null, member.id)
  const [state, formAction, isPending] = useActionState(updateMemberAction, initialState)
  const [fullName, setFullName] = useState(member.full_name)
  const [email, setEmail] = useState(member.email)
  const [phone, setPhone] = useState(member.phone ?? '')
  const [status, setStatus] = useState<MemberStatus>(member.status)

  const fullNameError = state?.errors?.fullName?.[0]
  const emailError = state?.errors?.email?.[0]
  const phoneError = state?.errors?.phone?.[0]
  const statusError = state?.errors?.status?.[0]

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value

    if (isMemberStatus(nextStatus)) {
      setStatus(nextStatus)
    }
  }

  return (
    <form
      action={formAction}
      noValidate
      className='max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'
    >
      <div className='mb-6'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>Members</p>
        <h1 className='mt-2 text-2xl font-semibold text-[var(--foreground)]'>Edit member</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Update the member record details and current status.
        </p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div>
          <label
            htmlFor='full-name-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Full name
          </label>
          <input
            type='text'
            name='fullName'
            id='full-name-input'
            autoComplete='name'
            placeholder='Alex Morgan'
            value={fullName}
            onChange={event => setFullName(event.target.value)}
            aria-invalid={Boolean(fullNameError)}
            aria-describedby={fullNameError ? 'full-name-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {fullNameError && (
            <p id='full-name-error' className='mt-2 text-sm text-[var(--danger)]'>
              {fullNameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='email-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Email
          </label>
          <input
            type='email'
            name='email'
            id='email-input'
            autoComplete='email'
            placeholder='alex@example.com'
            value={email}
            onChange={event => setEmail(event.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'email-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {emailError && (
            <p id='email-error' className='mt-2 text-sm text-[var(--danger)]'>
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='phone-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Phone
          </label>
          <input
            type='tel'
            name='phone'
            id='phone-input'
            autoComplete='tel'
            placeholder='+1 555 0101'
            value={phone}
            onChange={event => setPhone(event.target.value)}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'phone-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          />
          {phoneError && (
            <p id='phone-error' className='mt-2 text-sm text-[var(--danger)]'>
              {phoneError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='status-input'
            className='mb-2 block text-sm font-medium text-[var(--foreground)]'
          >
            Status
          </label>
          <select
            name='status'
            id='status-input'
            value={status}
            onChange={handleStatusChange}
            aria-invalid={Boolean(statusError)}
            aria-describedby={statusError ? 'status-error' : undefined}
            className='w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm capitalize text-[var(--foreground)] outline-none transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
          >
            {memberStatuses.map(memberStatus => (
              <option key={memberStatus} value={memberStatus}>
                {memberStatusLabels[memberStatus]}
              </option>
            ))}
          </select>
          {statusError && (
            <p id='status-error' className='mt-2 text-sm text-[var(--danger)]'>
              {statusError}
            </p>
          )}
        </div>
      </div>

      {state.message && (
        <p
          role='status'
          className='mt-5 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]'
        >
          {state.message}
        </p>
      )}

      <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
        <Link
          href={`/dashboard/members/${member.id}`}
          className='rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2.5 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]'
        >
          Cancel
        </Link>
        <button
          type='submit'
          disabled={isPending}
          className='rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-2)] disabled:text-[var(--muted)] cursor-pointer'
        >
          {isPending ? 'Saving member...' : 'Save member'}
        </button>
      </div>
    </form>
  )
}
