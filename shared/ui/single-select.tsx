'use client'

import { useEffect, useId, useRef, useState, type AriaAttributes } from 'react'
import type { SelectOption } from './select-option'

type SingleSelectProps<T extends string> = {
  label: string
  name: string
  options: readonly SelectOption<T>[]
  value: T
  disabled?: boolean
  placeholder?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  'aria-describedby'?: string
  onChange: (value: T) => void
}

export function SingleSelect<T extends string>({
  label,
  name,
  options,
  value,
  disabled,
  placeholder,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onChange,
}: SingleSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const generatedId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerId = `${generatedId}-trigger`
  const optionsId = `${generatedId}-options`

  useEffect(() => {
    if (!open) {
      return
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!window.matchMedia?.('(min-width: 768px)').matches) {
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

  const selectedOption = options.find(option => option.value === value)
  const selectedLabel = selectedOption?.label ?? (value === '' ? placeholder : undefined) ?? value

  function selectValue(nextValue: T) {
    onChange(nextValue)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={containerRef} className='relative w-full min-w-0 max-w-full'>
      <label htmlFor={triggerId} className='mb-2 block font-medium'>
        {label}
      </label>

      <input type='hidden' name={name} value={value} disabled={disabled} />

      <button
        ref={triggerRef}
        id={triggerId}
        type='button'
        disabled={disabled}
        aria-controls={optionsId}
        aria-expanded={open}
        aria-label={`${label}: ${selectedLabel}`}
        aria-describedby={ariaDescribedBy}
        onClick={() => setOpen(current => !current)}
        className='flex min-w-0 w-full cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--control)] px-3 py-2 text-left text-[var(--foreground)] outline-none transition-colors enabled:hover:bg-[var(--control-hover)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 disabled:cursor-not-allowed disabled:border-[var(--border)]! disabled:bg-[var(--surface-2)]! disabled:opacity-60'
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            disabled
              ? 'text-[var(--muted)]'
              : selectedOption
                ? 'text-[var(--foreground)]'
                : 'text-[var(--foreground)]/70'
          }`}
        >
          {selectedLabel}
        </span>

        <svg
          aria-hidden='true'
          className={`size-4 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${
            disabled ? 'text-[var(--muted)]' : 'text-[var(--foreground)]/70'
          } ${
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
        id={optionsId}
        role='radiogroup'
        aria-label={`${label} options`}
        aria-hidden={!open}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        inert={!open}
        className={`static z-30 mt-1 grid w-full min-w-0 max-w-full origin-top transition-[grid-template-rows,opacity,transform] duration-200 ease-out motion-reduce:transition-none md:absolute md:left-0 md:min-w-[12rem] ${
          open
            ? 'grid-rows-[1fr] translate-y-0 opacity-100'
            : 'pointer-events-none grid-rows-[0fr] -translate-y-1 opacity-0'
        }`}
      >
        <div className='min-h-0 min-w-0 max-w-full overflow-hidden'>
          <div className='max-h-64 min-w-0 max-w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-lg'>
            {options.map(option => {
              const checked = value === option.value

              return (
                <label
                  key={option.value}
                  className={`flex min-w-0 max-w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 transition-colors ${
                    disabled
                      ? 'cursor-not-allowed text-[var(--muted)]'
                      : 'cursor-pointer hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <input
                    type='radio'
                    value={option.value}
                    checked={checked}
                    disabled={disabled}
                    aria-label={`${label}: ${option.label}`}
                    onChange={() => selectValue(option.value)}
                    className='peer sr-only'
                  />

                  <span
                    aria-hidden='true'
                    className='flex size-4 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--control)] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]/40'
                  >
                    {checked && <span className='size-2 rounded-full bg-[var(--primary)]' />}
                  </span>

                  <span
                    className={`min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-sm ${
                      disabled ? 'text-[var(--muted)]' : 'text-[var(--foreground)]'
                    }`}
                  >
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
