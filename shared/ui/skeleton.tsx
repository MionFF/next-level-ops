type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden='true'
      className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--border)]/70 motion-reduce:animate-none ${className}`}
    />
  )
}
