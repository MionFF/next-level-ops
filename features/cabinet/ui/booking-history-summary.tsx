import type { BookingHistorySummary } from '../model/cabinet-booking'

type StatTone = 'neutral' | 'info' | 'danger'

const valueToneClasses: Record<StatTone, string> = {
  neutral: 'text-[var(--foreground)]',
  info: 'text-[var(--info)]',
  danger: 'text-[var(--danger)]',
}

function StatBox({ label, value, tone }: { label: string; value: number; tone: StatTone }) {
  return (
    <div className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-center'>
      <p className={`text-2xl font-bold ${valueToneClasses[tone]}`}>{value}</p>
      <p className='mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]'>
        {label}
      </p>
    </div>
  )
}

export function BookingHistorySummaryCard({ summary }: { summary: BookingHistorySummary }) {
  return (
    <section className='mt-8 max-lg:border-0 max-lg:bg-transparent max-lg:p-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6'>
      <div className='mb-6'>
        <h2 className='text-2xl font-semibold text-[var(--foreground)]'>Booking summary</h2>
        <p className='mt-2 text-sm text-[var(--muted)]'>
          A quick overview of your studio bookings.
        </p>
      </div>

      <div className='grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4'>
        <StatBox label='Total' value={summary.total} tone='neutral' />
        <StatBox label='Upcoming' value={summary.upcoming} tone='info' />
        <StatBox label='Completed' value={summary.completed} tone='neutral' />
        <StatBox label='Cancelled' value={summary.cancelled} tone='danger' />
      </div>
    </section>
  )
}
