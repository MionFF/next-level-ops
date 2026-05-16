import type { CabinetProfile, LinkedMember } from '../model/cabinet-profile'

export function LinkedMemberOverview({ member }: { member: LinkedMember }) {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-[var(--foreground)]'>My account</h1>
        <p className='mt-2 text-sm text-[var(--muted)]'>Your studio profile and account details.</p>
      </div>

      <h2 className='mb-3 text-lg font-semibold text-[var(--foreground)]'>Personal information</h2>

      <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4'>
        <dl>
          <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
            <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              Name
            </dt>
            <dd className='mt-1 text-sm text-[var(--foreground)]'>{member.full_name}</dd>
          </div>
          <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
            <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              Email
            </dt>
            <dd className='mt-1 text-sm text-[var(--foreground)]'>{member.email}</dd>
          </div>
          <div className='border-b border-[var(--border)] py-4 last:border-b-0'>
            <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              Phone
            </dt>
            <dd className='mt-1 text-sm text-[var(--foreground)]'>{member.phone ?? 'No phone'}</dd>
          </div>
          <div className='py-4'>
            <dt className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
              Account status
            </dt>
            <dd className='mt-1 text-sm capitalize text-[var(--foreground)]'>
              <span className='inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium'>
                {member.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
