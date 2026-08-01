'use client'

import { useEffect, useRef, useState } from 'react'
import type { FilterOption } from './filter-option'

type MultiSelectFilterProps<T extends string> = {
  label: string
  options: readonly FilterOption<T>[]
  selectedValues: readonly T[]
  disabled?: boolean
  onToggle: (value: T) => void
}

export function MultiSelectFilter<T extends string>({
  label,
  options,
  selectedValues,
  disabled,
  onToggle,
}: MultiSelectFilterProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!window.matchMedia('(min-width: 768px)').matches) {
        return
      }

      if (!(event.target instanceof Node)) {
        return
      }

      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectedOption =
    selectedValues.length === 1
      ? options.find(option => option.value === selectedValues[0])
      : undefined

  const summary =
    selectedValues.length === 0
      ? 'All'
      : (selectedOption?.label ?? `${selectedValues.length} selected`)

  return (
    <div ref={containerRef} className='relative min-w-0'>
      <span className='mb-2 block font-medium'>{label}</span>

      <button
        ref={triggerRef}
        type='button'
        disabled={disabled}
        aria-expanded={open}
        aria-label={`${label}: ${summary}`}
        onClick={() => setOpen(current => !current)}
        className='flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-[var(--foreground)] outline-none transition-colors hover:bg-[var(--surface-2)]/80 focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <span className='truncate'>{summary}</span>

        <svg
          aria-hidden='true'
          className={`size-4 shrink-0 text-[var(--muted)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='m6 9 6 6 6-6' />
        </svg>
      </button>

      <div
        aria-hidden={!open}
        inert={!open}
        className={`static z-30 mt-1 grid w-full origin-top transition-[grid-template-rows,opacity,transform] duration-200 ease-out motion-reduce:transition-none md:absolute md:left-0 md:min-w-[14rem] ${
          open
            ? 'grid-rows-[1fr] translate-y-0 opacity-100'
            : 'pointer-events-none grid-rows-[0fr] -translate-y-1 opacity-0'
        }`}
      >
        <div className='min-h-0 overflow-hidden'>
          <div className='max-h-64 overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg'>
            {options.map(option => {
              const checked = selectedValues.includes(option.value)

              return (
                <label
                  key={option.value}
                  className='flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 transition-colors hover:bg-[var(--surface-2)]'
                >
                  <input
                    type='checkbox'
                    checked={checked}
                    disabled={disabled}
                    aria-label={`${label}: ${option.label}`}
                    onChange={() => onToggle(option.value)}
                    className='size-4 accent-[var(--primary)]'
                  />

                  <span className='text-sm text-[var(--foreground)]'>{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
