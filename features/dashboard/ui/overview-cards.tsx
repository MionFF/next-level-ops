import Link from 'next/link'

import type { DashboardSummary } from '@/features/dashboard/model/dashboard-summary'

type SummaryCardProps = {
  label: string
  value: number
  href: string
  linkLabel: string
}

type QuickAction = {
  label: string
  href: string
  linkLabel: string
}

function SummaryCard({ label, value, href, linkLabel }: SummaryCardProps) {
  return (
    <div className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5'>
      <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
        {label}
      </p>
      <p className='mt-2 text-3xl font-semibold text-[var(--foreground)]'>{value}</p>
      <Link
        href={href}
        className='mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline'
      >
        {linkLabel} &rarr;
      </Link>
    </div>
  )
}

const quickActions: QuickAction[] = [
  {
    label: 'Add member',
    href: '/dashboard/members/new',
    linkLabel: 'New member',
  },
  {
    label: 'Add trainer',
    href: '/dashboard/trainers/new',
    linkLabel: 'New trainer',
  },
  {
    label: 'Add plan',
    href: '/dashboard/plans/new',
    linkLabel: 'New plan',
  },
  {
    label: 'Add session',
    href: '/dashboard/sessions/new',
    linkLabel: 'New session',
  },
  {
    label: 'Add booking',
    href: '/dashboard/bookings/new',
    linkLabel: 'New booking',
  },
]

function QuickActionCard({ label, href, linkLabel }: QuickAction) {
  return (
    <div className='rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5'>
      <p className='text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
        Quick action
      </p>
      <p className='mt-2 text-sm font-medium text-[var(--foreground)]'>{label}</p>
      <Link
        href={href}
        className='mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline'
      >
        {linkLabel} &rarr;
      </Link>
    </div>
  )
}

export function OverviewCards({ summary }: { summary: DashboardSummary }) {
  const cards: SummaryCardProps[] = [
    {
      label: 'Members',
      value: summary.totalMembers,
      href: '/dashboard/members',
      linkLabel: 'View members',
    },
    {
      label: 'Trainers',
      value: summary.totalTrainers,
      href: '/dashboard/trainers',
      linkLabel: 'View trainers',
    },
    {
      label: 'Active plans',
      value: summary.activePlans,
      href: '/dashboard/plans',
      linkLabel: 'View plans',
    },
    {
      label: 'Upcoming sessions',
      value: summary.upcomingSessions,
      href: '/dashboard/sessions',
      linkLabel: 'View sessions',
    },
    {
      label: 'Confirmed bookings',
      value: summary.confirmedBookings,
      href: '/dashboard/bookings',
      linkLabel: 'View bookings',
    },
  ]

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
          Overview
        </h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {cards.map(card => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]'>
          Quick actions
        </h2>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
          {quickActions.map(action => (
            <QuickActionCard key={action.label} {...action} />
          ))}
        </div>
      </div>
    </div>
  )
}
