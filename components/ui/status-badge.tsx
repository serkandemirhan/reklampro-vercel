import { ReactNode } from 'react'

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

type StatusBadgeProps = {
  tone?: StatusTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const toneClassMap: Record<StatusTone, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  muted: 'badge-muted',
}

export default function StatusBadge({ tone = 'muted', icon, children, className }: StatusBadgeProps) {
  const base = `badge ${toneClassMap[tone]}`
  const composed = className ? `${base} ${className}` : base

  return (
    <span className={composed}>
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
