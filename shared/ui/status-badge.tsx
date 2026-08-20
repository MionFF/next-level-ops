export type StatusTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral'

type StatusBadgeProps = {
  label: string
  tone: StatusTone
}

const toneClasses: Record<StatusTone, string> = {
  success: 'border-[var(--success)]/35 bg-[var(--success)]/10 text-[var(--success)]',
  info: 'border-[var(--info)]/35 bg-[var(--info)]/10 text-[var(--info)]',
  warning: 'border-[var(--warning)]/35 bg-[var(--warning)]/10 text-[var(--warning)]',
  danger: 'border-[var(--danger)]/35 bg-[var(--danger)]/10 text-[var(--danger)]',
  neutral: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]',
}

const dotClasses: Record<StatusTone, string> = {
  success: 'bg-[var(--success)]',
  info: 'bg-[var(--info)]',
  warning: 'bg-[var(--warning)]',
  danger: 'bg-[var(--danger)]',
  neutral: 'bg-[var(--muted)]',
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      <span aria-hidden='true' className={`size-1.5 shrink-0 rounded-full ${dotClasses[tone]}`} />
      <span className='truncate'>{label}</span>
    </span>
  )
}
