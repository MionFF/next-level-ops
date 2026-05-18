import { fetchDashboardSummary } from '@/features/dashboard/model/dashboard-summary'
import { OverviewCards } from '@/features/dashboard/ui/overview-cards'

export default async function Dashboard() {
  const summary = await fetchDashboardSummary()

  return <OverviewCards summary={summary} />
}
