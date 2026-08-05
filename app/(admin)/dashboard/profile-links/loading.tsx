import { ProfileLinksSkeleton } from '@/features/profile-links/ui/profile-links-skeleton'

export default function ProfileLinksLoading() {
  return (
    <div role='status' aria-label='Loading profile links'>
      <span className='sr-only'>Loading profile links...</span>
      <ProfileLinksSkeleton />
    </div>
  )
}
