'use client'

import { useEffect, useRef, useState } from 'react'
import type { FilterOption } from './filter-option'

type SingleSelectFilterProps<T extends string> = {
  label: string
  name: string
  options: readonly FilterOption<T>[]
  value: T
  disabled?: boolean
  onChange: (value: T) => void
}

export function SingleSelectFilter<T extends string>({
  label,
  name,
  options,
  value,
  disabled,
  onChange,
}: SingleSelectFilterProps<T>) {
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

  const selectedLabel = options.find(option => option.value === value)?.label ?? value

  function selectValue(nextValue: T) {
    onChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} className='relative min-w-0'>
      <span className='mb-2 block font-medium'>{label}</span>

      <button
        ref={triggerRef}
        type='button'
        disabled={disabled}
        aria-expanded={open}
        aria-label={`${label}: ${selectedLabel}`}
        onClick={() => setOpen(current => !current)}
        className='flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-[var(--foreground)] outline-none transition-colors hover:bg-[var(--surface-2)]/80 focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <span className='truncate'>{selectedLabel}</span>

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
        className={`static z-30 mt-1 grid w-full origin-top transition-[grid-template-rows,opacity,transform] duration-200 ease-out motion-reduce:transition-none md:absolute md:left-0 md:min-w-[12rem] ${
          open
            ? 'grid-rows-[1fr] translate-y-0 opacity-100'
            : 'pointer-events-none grid-rows-[0fr] -translate-y-1 opacity-0'
        }`}
      >
        <div className='min-h-0 overflow-hidden'>
          <div className='max-h-64 overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg'>
            {options.map(option => {
              const checked = value === option.value

              return (
                <label
                  key={option.value}
                  className='flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 transition-colors hover:bg-[var(--surface-2)]'
                >
                  <input
                    type='radio'
                    name={name}
                    checked={checked}
                    disabled={disabled}
                    aria-label={`${label}: ${option.label}`}
                    onChange={() => selectValue(option.value)}
                    className='peer sr-only'
                  />

                  <span
                    aria-hidden='true'
                    className='flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]/40'
                  >
                    {checked && <span className='size-2 rounded-full bg-[var(--primary)]' />}
                  </span>

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
