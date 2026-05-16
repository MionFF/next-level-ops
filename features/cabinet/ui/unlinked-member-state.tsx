export function UnlinkedMemberState() {
  return (
    <section className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold text-[var(--foreground)]'>My account</h1>
      </div>

      <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-8 text-center'>
        <h2 className='text-lg font-semibold text-[var(--foreground)]'>
          Membership profile not linked
        </h2>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          Your account is not linked to a studio member profile yet. Please contact the studio admin
          to finish setup.
        </p>
      </div>
    </section>
  )
}
