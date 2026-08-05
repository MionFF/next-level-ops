import { CabinetOverviewSkeleton } from '@/features/cabinet/ui/cabinet-overview-skeleton'

export default function CabinetLoading() {
  return (
    <div role='status' aria-label='Loading cabinet overview'>
      <span className='sr-only'>Loading cabinet overview...</span>
      <CabinetOverviewSkeleton />
    </div>
  )
}
