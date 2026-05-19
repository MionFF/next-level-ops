import Link from 'next/link'
import type { MemberStatusFilter } from '../model/member'

type MembersFiltersProps = {
  search: string
  status: MemberStatusFilter
}

export default function MembersFilters({ search, status }: MembersFiltersProps) {
  return (
    <form
      action='/dashboard/members'
      method='get'
      className='mb-8 flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--foreground)] sm:flex-row sm:items-end'
    >
      <label htmlFor='search' className='flex flex-1 flex-col gap-2'>
        <span className='font-medium'>Search</span>
        <input
          type='search'
          id='search'
          name='search'
          defaultValue={search}
          placeholder='Search by name or email'
          className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
        />
      </label>

      <label htmlFor='status' className='flex flex-col gap-2'>
        <span className='font-medium'>Status</span>
        <select
          id='status'
          name='status'
          defaultValue={status}
          className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25'
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='paused'>Paused</option>
          <option value='inactive'>Inactive</option>
        </select>
      </label>

      <div className='flex gap-2 sm:w-auto'>
        <button
          type='submit'
          className='flex-1 cursor-pointer whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 sm:flex-none'
        >
          Apply filters
        </button>

        <Link
          href='/dashboard/members'
          className='flex-1 rounded-[var(--radius-md)] border border-[var(--border)] px-4 py-2 text-center font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)] sm:flex-none'
        >
          Reset
        </Link>
      </div>
    </form>
  )
}
