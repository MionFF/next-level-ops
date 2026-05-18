export function NoActiveMembershipCard() {
  return (
    <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center'>
      <h3 className='text-sm font-semibold text-[var(--foreground)]'>No active membership</h3>
      <p className='mt-2 text-sm text-[var(--muted)]'>
        You do not have an active membership right now. Please contact the studio admin for details.
      </p>
    </div>
  )
}
