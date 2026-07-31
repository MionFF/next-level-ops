'use client'

import { useId, useState, type ReactNode, type SubmitEventHandler } from 'react'

type OperationsFilterPanelProps = {
  activeFilterCount: number
  children: ReactNode
  onSubmit: SubmitEventHandler<HTMLFormElement>
}

function getActiveFilterSummary(activeFilterCount: number) {
  if (activeFilterCount === 0) {
    return 'No active filters'
  }

  return `${activeFilterCount} active ${activeFilterCount === 1 ? 'filter' : 'filters'}`
}

export function OperationsFilterPanel({
  activeFilterCount,
  children,
  onSubmit,
}: OperationsFilterPanelProps) {
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <form
      onSubmit={onSubmit}
      className='relative z-10 mb-8 min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)]'
    >
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(current => !current)}
        className='flex w-full items-center justify-between gap-4 rounded-[var(--radius-md)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface-2)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]/40 md:hidden'
      >
        <span className='min-w-0'>
          <span className='block font-semibold text-[var(--foreground)]'>Filters</span>

          <span className='mt-0.5 block text-xs text-[var(--muted)]'>
            {getActiveFilterSummary(activeFilterCount)}
          </span>
        </span>

        <svg
          aria-hidden='true'
          viewBox='0 0 20 20'
          fill='none'
          className={`size-5 shrink-0 text-[var(--muted)] transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d='m5 7.5 5 5 5-5'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none md:grid-rows-[1fr] md:opacity-100 ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div
          className={`min-h-0 overflow-hidden md:overflow-visible ${
            isOpen ? 'visible' : 'invisible md:visible'
          }`}
        >
          {children}
        </div>
      </div>
    </form>
  )
}
