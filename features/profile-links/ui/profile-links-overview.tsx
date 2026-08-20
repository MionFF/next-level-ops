import type { ClientProfile, LinkedProfileMemberPair, MemberOption } from '../model/profile-link'
import {
  isMemberStatus,
  memberStatusLabels,
  type MemberStatus,
} from '@/features/members/model/member'
import { StatusBadge, type StatusTone } from '@/shared/ui/status-badge'
import ProfileLinkForm from './profile-link-form'
import UnlinkProfileMemberButton from './unlink-profile-member-button'

type ProfileLinksOverviewProps = {
  unlinkedProfiles: ClientProfile[]
  unlinkedMembers: MemberOption[]
  linkedPairs: LinkedProfileMemberPair[]
  errorMessage?: string
}

const PREVIEW_LIMIT = 5

function getProfileLabel(profile: ClientProfile) {
  return profile.full_name?.trim() || 'Unnamed client profile'
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className='rounded-[var(--radius-md)] border border-dashed border-[var(--border)] px-3 py-3 text-sm text-[var(--muted)]'>
      {message}
    </div>
  )
}

function SummaryCard({ label, count }: { label: string; count: number }) {
  return (
    <div className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3'>
      <p className='text-sm text-[var(--muted)]'>{label}</p>
      <p className='mt-1 text-2xl font-semibold text-[var(--foreground)]'>{count}</p>
    </div>
  )
}

const memberStatusTones: Record<MemberStatus, StatusTone> = {
  active: 'success',
  paused: 'warning',
  inactive: 'neutral',
}

function MemberStatusBadge({ status }: { status: string }) {
  if (!isMemberStatus(status)) {
    return <StatusBadge label={status} tone='neutral' />
  }

  return <StatusBadge label={memberStatusLabels[status]} tone={memberStatusTones[status]} />
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className='min-w-0'>
      <h2 className='break-words text-lg font-semibold text-[var(--foreground)]'>{title}</h2>
      <p className='mt-1 max-w-3xl break-words text-sm leading-6 text-[var(--muted)]'>
        {description}
      </p>
    </div>
  )
}

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]'>
      <div className='min-w-0 px-4 pt-3'>
        <h3 className='break-words text-sm font-semibold text-[var(--foreground)]'>{title}</h3>
        <p className='mt-1 break-words text-sm leading-6 text-[var(--muted)]'>{description}</p>
      </div>
      <div className='px-4 py-3'>{children}</div>
    </div>
  )
}

export default function ProfileLinksOverview({
  unlinkedProfiles,
  unlinkedMembers,
  linkedPairs,
  errorMessage,
}: ProfileLinksOverviewProps) {
  const visibleProfiles = unlinkedProfiles.slice(0, PREVIEW_LIMIT)
  const visibleMembers = unlinkedMembers.slice(0, PREVIEW_LIMIT)

  const hiddenProfilesCount = Math.max(unlinkedProfiles.length - visibleProfiles.length, 0)
  const hiddenMembersCount = Math.max(unlinkedMembers.length - visibleMembers.length, 0)

  return (
    <section className='min-w-0 space-y-6'>
      <header className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
          Access control
        </p>
        <h1 className='mt-2 break-words text-2xl font-semibold text-[var(--foreground)]'>
          Profile links
        </h1>
        <p className='mt-2 max-w-3xl break-words text-sm leading-6 text-[var(--muted)]'>
          Connect client app profiles to studio member records so the client cabinet can resolve the
          correct business data.
        </p>
      </header>

      {errorMessage ? (
        <div className='rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]'>
          Failed to load profile links.
        </div>
      ) : (
        <>
          <div className='grid min-w-0 gap-3 md:grid-cols-3'>
            <SummaryCard label='Unlinked profiles' count={unlinkedProfiles.length} />
            <SummaryCard label='Available members' count={unlinkedMembers.length} />
            <SummaryCard label='Linked pairs' count={linkedPairs.length} />
          </div>

          <section className='min-w-0 space-y-4'>
            <SectionHeader
              title='Current links'
              description='Existing profile-member connections used by the client cabinet.'
            />

            {linkedPairs.length === 0 ? (
              <EmptyState message='No linked profile-member pairs.' />
            ) : (
              <>
                <div className='hidden overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] lg:block'>
                  <table className='min-w-full table-fixed divide-y divide-[var(--border)] bg-[var(--surface)] text-left text-sm'>
                    <thead className='bg-[var(--surface-2)] text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                      <tr>
                        <th className='w-[30%] px-4 py-3'>Profile</th>
                        <th className='w-[28%] px-4 py-3'>Member</th>
                        <th className='w-[30%] px-4 py-3'>Member email</th>
                        <th className='w-[12%] px-4 py-3 text-right'>Actions</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-[var(--border)]'>
                      {linkedPairs.map(pair => (
                        <tr
                          key={pair.profile.id}
                          className='text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)]/50'
                        >
                          <td className='px-4 py-3 font-medium'>
                            <div className='line-clamp-2 max-w-full'>
                              {getProfileLabel(pair.profile)}
                            </div>
                          </td>
                          <td className='px-4 py-3 font-medium'>
                            <div className='line-clamp-2 max-w-full'>{pair.member.full_name}</div>
                          </td>
                          <td className='px-4 py-3 text-[var(--muted)]'>
                            <div className='truncate'>{pair.member.email}</div>
                          </td>
                          <td className='px-4 py-3 text-right'>
                            <UnlinkProfileMemberButton profileId={pair.profile.id} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className='grid min-w-0 gap-3 lg:hidden'>
                  {linkedPairs.map(pair => (
                    <li
                      key={pair.profile.id}
                      className='min-w-0 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3'
                    >
                      <div className='grid min-w-0 gap-3 sm:grid-cols-2'>
                        <div className='min-w-0'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                            Profile
                          </p>
                          <p className='mt-1 break-words text-sm font-medium text-[var(--foreground)]'>
                            {getProfileLabel(pair.profile)}
                          </p>
                        </div>

                        <div className='min-w-0'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                            Member
                          </p>
                          <p className='mt-1 break-words text-sm font-medium text-[var(--foreground)]'>
                            {pair.member.full_name}
                          </p>
                        </div>

                        <div className='min-w-0'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                            Member email
                          </p>
                          <p className='mt-1 break-all text-xs text-[var(--muted)]'>
                            {pair.member.email}
                          </p>
                        </div>

                        <div className='min-w-0'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-[var(--muted)]'>
                            Actions
                          </p>
                          <div className='mt-2'>
                            <UnlinkProfileMemberButton profileId={pair.profile.id} />
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className='min-w-0 space-y-4'>
            <SectionHeader
              title='Ready to link'
              description='Profiles and members currently available for the next linking step.'
            />

            <ProfileLinkForm profiles={unlinkedProfiles} members={unlinkedMembers} />

            <div className='grid min-w-0 gap-4 lg:grid-cols-2'>
              <PreviewCard
                title='Unlinked client profiles'
                description='Client app profiles without a connected studio member.'
              >
                {visibleProfiles.length === 0 ? (
                  <EmptyState message='No unlinked client profiles.' />
                ) : (
                  <div className='min-w-0'>
                    <ul className='divide-y divide-[var(--border)]'>
                      {visibleProfiles.map(profile => (
                        <li key={profile.id} className='py-2.5 first:pt-0 last:pb-0'>
                          <p className='break-words text-sm font-medium text-[var(--foreground)]'>
                            {getProfileLabel(profile)}
                          </p>
                        </li>
                      ))}
                    </ul>

                    {hiddenProfilesCount > 0 && (
                      <p className='border-t border-[var(--border)] pt-3 text-sm text-[var(--muted)]'>
                        + {hiddenProfilesCount} more profiles
                      </p>
                    )}
                  </div>
                )}
              </PreviewCard>

              <PreviewCard
                title='Available members'
                description='Studio members not connected to a client profile yet.'
              >
                {visibleMembers.length === 0 ? (
                  <EmptyState message='No available members.' />
                ) : (
                  <div className='min-w-0'>
                    <ul className='divide-y divide-[var(--border)]'>
                      {visibleMembers.map(member => (
                        <li key={member.id} className='py-2.5 first:pt-0 last:pb-0'>
                          <div className='flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                            <div className='min-w-0'>
                              <p className='break-words text-sm font-medium text-[var(--foreground)]'>
                                {member.full_name}
                              </p>
                              <p className='mt-1 break-all text-xs text-[var(--muted)]'>
                                {member.email}
                              </p>
                            </div>
                            <MemberStatusBadge status={member.status} />
                          </div>
                        </li>
                      ))}
                    </ul>

                    {hiddenMembersCount > 0 && (
                      <p className='border-t border-[var(--border)] pt-3 text-sm text-[var(--muted)]'>
                        + {hiddenMembersCount} more members
                      </p>
                    )}
                  </div>
                )}
              </PreviewCard>
            </div>
          </section>
        </>
      )}
    </section>
  )
}
