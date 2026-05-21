import Link from 'next/link'

export default function Page() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10 text-[var(--foreground)]'>
      <div className='w-full max-w-sm space-y-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>Access denied</h1>
          <p className='text-sm text-[var(--muted)]'>
            You do not have permission to access this area.
          </p>
        </div>

        <Link
          href='/'
          className='inline-block rounded-[var(--radius-md)] bg-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary-foreground)] no-underline transition-opacity hover:opacity-90'
        >
          Go to my workspace
        </Link>
      </div>
    </main>
  )
}
