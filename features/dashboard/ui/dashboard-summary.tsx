import { fetchDashboardSummary } from '@/features/dashboard/model/dashboard-summary'
import { DashboardSummaryCards } from '@/features/dashboard/ui/overview-cards'

export async function DashboardSummary() {
  const summary = await fetchDashboardSummary()

  return <DashboardSummaryCards summary={summary} />
}
